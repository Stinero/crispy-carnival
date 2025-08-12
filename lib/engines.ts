


import { FunctionDeclaration } from '@google/genai';
import { GlobalPolicy, ToolRule, GateDecision, SafetyLevel, ConsentStore, RouteProposal } from '../types';
import { wildcardToRegExp } from './wildcard';
import { generateId } from './utils';

class RateLimiter {
    private rpm?: number;
    private cooldown_sec: number;
    private _history: Record<string, number[]> = {};
    private _last_time: Record<string, number> = {};

    constructor(rpm?: number, cooldown_sec: number = 0.0) {
        this.rpm = rpm;
        this.cooldown_sec = cooldown_sec;
    }

    allow(key: string, now?: number): [boolean, number] {
        const t = now || Date.now() / 1000;
        if (this.rpm === undefined && this.cooldown_sec <= 0) {
            return [true, 0.0];
        }
        const hist = this._history[key] || [];
        this._history[key] = hist;

        // Drop entries older than 60s
        const cut = t - 60.0;
        while (hist.length > 0 && hist[0] < cut) {
            hist.shift();
        }

        // Cooldown check
        const last = this._last_time[key] || 0.0;
        if (this.cooldown_sec > 0 && (t - last) < this.cooldown_sec) {
            const retry = this.cooldown_sec - (t - last);
            return [false, Math.max(0.0, retry)];
        }

        // RPM check
        if (this.rpm !== undefined && hist.length >= this.rpm) {
            const retry = 60.0 - (t - hist[0]);
            return [false, Math.max(0.0, retry)];
        }

        // Allowed; record
        hist.push(t);
        this._last_time[key] = t;
        return [true, 0.0];
    }
}


export class GatingEngine {
    private tool_specs: Record<string, any>;
    policy: GlobalPolicy;
    rules: Record<string, ToolRule>;
    private _limiters: Record<string, RateLimiter> = {};
    private _consent: ConsentStore;

    constructor(
        tool_specs: any[],
        policy?: GlobalPolicy,
        rules?: Record<string, ToolRule>,
    ) {
        this.tool_specs = tool_specs.reduce((acc, spec) => {
            acc[spec.function.name] = spec;
            return acc;
        }, {} as Record<string, any>);
        
        this.policy = policy || {
            allow_safety_levels: [SafetyLevel.SAFE, SafetyLevel.SENSITIVE],
            require_consent_for_sensitive: true,
            require_consent_for_admin: true,
            network_enabled: true,
            clamp_args: true,
            max_timeout_sec: 180,
            remember_consent: true,
        };
        this.rules = rules || {};
        this._consent = new ConsentStore();

        for (const name in this.rules) {
            const rule = this.rules[name];
            if (rule.rpm_limit !== undefined || rule.cooldown_sec > 0) {
                this._limiters[name] = new RateLimiter(rule.rpm_limit, rule.cooldown_sec);
            }
        }
    }

    check(tool_name: string, args: Record<string, any>): GateDecision {
        const baseDecision: Omit<GateDecision, 'allowed' | 'reason' | 'requires_consent' | 'patched_args'> = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            tool_name,
            args,
            warnings: [],
            retry_after_sec: 0.0,
            meta: {},
        }

        if (!this.tool_specs[tool_name]) {
            return { ...baseDecision, allowed: false, reason: `unknown tool: ${tool_name}`, requires_consent: false, patched_args: args };
        }

        if (this.policy.tool_allowlist && !this.policy.tool_allowlist.includes(tool_name)) {
            return { ...baseDecision, allowed: false, reason: `tool not in allowlist: ${tool_name}`, requires_consent: false, patched_args: args };
        }
        if (this.policy.tool_denylist && this.policy.tool_denylist.includes(tool_name)) {
            return { ...baseDecision, allowed: false, reason: `tool is denylisted: ${tool_name}`, requires_consent: false, patched_args: args };
        }

        const rule = this.rules[tool_name] || { name: tool_name, enabled: true, safety: SafetyLevel.SAFE, required_envs: [], required_deps: [], network: false, cooldown_sec: 0, arg_limits: {} };
        if (!rule.enabled) {
            return { ...baseDecision, allowed: false, reason: `tool disabled by policy: ${tool_name}`, requires_consent: false, patched_args: args };
        }
        
        const safetyCheckRequiresConsent = (rule.safety === SafetyLevel.SENSITIVE && this.policy.require_consent_for_sensitive) ||
                                           (rule.safety === SafetyLevel.ADMIN && this.policy.require_consent_for_admin);

        if (!this.policy.allow_safety_levels.includes(rule.safety) || safetyCheckRequiresConsent) {
            const [consent_key, prompt] = this._build_consent(tool_name, args, rule);
            const domain = GatingEngine._extract_domains(args)[0] || null;

            if (this.policy.remember_consent && this._consent.check(tool_name, domain)) {
                // Previously granted, so continue
            } else {
                return {
                    ...baseDecision,
                    allowed: false,
                    requires_consent: true,
                    reason: `consent required for safety level: ${rule.safety}`,
                    consent_key: consent_key,
                    consent_prompt: this._format_consent_prompt(prompt),
                    patched_args: { ...args }
                };
            }
        }
        
        // NOTE: In a browser environment, we cannot reliably check for python deps or env vars.
        // This part of the logic from the python original is omitted.

        const domains = GatingEngine._extract_domains(args);
        if (rule.network) {
            if (!this.policy.network_enabled) {
                const [consent_key, prompt] = this._build_consent(tool_name, args, rule, undefined, "network access disabled");
                if (this.policy.remember_consent && this._consent.check(tool_name, null)){
                     // previously granted
                } else {
                    return { ...baseDecision, allowed: false, requires_consent: true, reason: "network access disabled by policy", consent_key, consent_prompt: this._format_consent_prompt(prompt), patched_args: { ...args }};
                }
            }
            for (const d of domains) {
                 if (rule.blocked_domains && GatingEngine._matches(d, rule.blocked_domains)) {
                    return { ...baseDecision, allowed: false, reason: `domain blocked: ${d}`, requires_consent: false, patched_args: args };
                 }
                 if (rule.allowed_domains && !GatingEngine._matches(d, rule.allowed_domains)) {
                    return { ...baseDecision, allowed: false, reason: `domain not in tool allowlist: ${d}`, requires_consent: false, patched_args: args };
                 }
                 if (this.policy.domain_denylist && GatingEngine._matches(d, this.policy.domain_denylist)) {
                    return { ...baseDecision, allowed: false, reason: `domain blocked by policy: ${d}`, requires_consent: false, patched_args: args };
                 }
                 if (this.policy.domain_allowlist && !GatingEngine._matches(d, this.policy.domain_allowlist)) {
                    const [consent_key, prompt] = this._build_consent(tool_name, args, rule, d, "domain not in allowlist");
                    if (this.policy.remember_consent && this._consent.check(tool_name, d)) {
                       // previously granted
                    } else {
                       return { ...baseDecision, allowed: false, requires_consent: true, reason: `domain ${d} not in allowlist`, consent_key, consent_prompt: this._format_consent_prompt(prompt), patched_args: { ...args }};
                    }
                 }
            }
        }
        
        const patched = { ...args };
        const warnings = this._clamp_args(tool_name, rule, patched);
        baseDecision.warnings = warnings;

        const limiter = this._limiters[tool_name];
        if (limiter) {
            const [ok, retry] = limiter.allow(tool_name);
            if (!ok) {
                return { ...baseDecision, allowed: false, reason: "rate limited", requires_consent: false, retry_after_sec: retry, patched_args: patched };
            }
        }
        
        return { ...baseDecision, allowed: true, requires_consent: false, reason: "Allowed by policy", patched_args: patched };
    }

    grant_consent(consent_key?: string | null): boolean {
        if (!consent_key) return false;
        try {
            const data = JSON.parse(consent_key);
            const tool = data["tool"];
            const domain = data["domain"];
            this._consent.grant(tool, domain);
            return true;
        } catch {
            return false;
        }
    }

    private static _extract_domains(args: Record<string, any>): string[] {
        const domains: string[] = [];
        const add = (url: string) => {
            try {
                const host = new URL(url).hostname;
                if (host) domains.push(host.toLowerCase());
            } catch {}
        };
        for (const k in args) {
            const v = args[k];
            if (typeof v === 'string' && v.startsWith("http")) {
                add(v);
            } else if (Array.isArray(v)) {
                v.forEach(item => {
                    if (typeof item === 'string' && item.startsWith("http")) add(item);
                });
            }
        }
        return domains;
    }

    private static _matches(domain: string, patterns: string[]): boolean {
        domain = domain.toLowerCase();
        for (const p of patterns) {
            if (wildcardToRegExp(p).test(domain)) return true;
        }
        return false;
    }

    private _clamp_args(tool_name: string, rule: ToolRule, args: Record<string, any>): string[] {
        const warnings: string[] = [];
        const limits = rule.arg_limits || {};
        const clamp_int = (key: string, hard_cap?: number) => {
            if (key in args && typeof args[key] === 'number') {
                const v = args[key];
                let cap = limits[key] !== undefined ? limits[key] : v;
                if (hard_cap !== undefined) cap = Math.min(cap, hard_cap);
                if (v > cap && this.policy.clamp_args) {
                    args[key] = cap;
                    warnings.push(`${tool_name}.${key} clamped to ${cap}`);
                } else if (v > cap) {
                    warnings.push(`${tool_name}.${key} exceeds limit ${cap}`);
                }
            }
        };

        clamp_int("timeout_sec", this.policy.max_timeout_sec);
        for (const key of ["max_results", "max_items", "max_rows", "max_bytes", "max_chars"]) {
            clamp_int(key);
        }
        return warnings;
    }

    private _build_consent(tool_name: string, args: Record<string, any>, rule: ToolRule, domain?: string, reason?: string): [string, Record<string, any>] {
        const dlist = GatingEngine._extract_domains(args);
        const domain_final = domain || (dlist.length > 0 ? dlist[0] : null);
        const payload = {
            tool: tool_name,
            args: args,
            safety: rule.safety,
            network: !!rule.network,
            domain: domain_final,
            reason: reason || "Consent required by policy",
        };
        const consent_key = JSON.stringify({ tool: payload.tool, domain: payload.domain });
        return [consent_key, payload];
    }
    
    private _format_consent_prompt(payload: Record<string, any>): string {
       let prompt = `The agent wants to run the tool \`${payload.tool}\` which is classified as **${payload.safety}**.`;
       if (payload.network) {
            prompt += ` It may access the network domain: **${payload.domain || '*'}**.`;
       }
       prompt += `\nReason: ${payload.reason}.`;
       return prompt;
    }
}

export class RoutingEngine {
    private static URL_RE = /https?:\/\/[^\s)>\]]+/gi;
    private tools: Record<string, any>;
    private available: Set<string>;

    constructor(tool_specs: any[]) {
        this.tools = tool_specs.reduce((acc, spec) => {
            acc[spec.function.name] = spec;
            return acc;
        }, {} as Record<string, any>);
        this.available = new Set(Object.keys(this.tools));
    }

    route(message: string): RouteProposal[] {
        const msg = (message || "").trim();
        const lower = msg.toLowerCase();
        const urls = RoutingEngine._extract_urls(msg);
        const proposals: RouteProposal[] = [];
        
        if (urls.length > 0) {
            if (this.available.has("e2b_browser_fetch")) {
                for(const u of urls) {
                    proposals.push({ tool: "e2b_browser_fetch", args: { url: u }, confidence: 0.85, reason: "Found URL; fetch content"});
                }
            }
        }
        // Add other heuristics from the python file here if needed
        if (!proposals.length && this.available.has("search_web")) {
            proposals.push({ tool: "search_web", args: { query: msg }, confidence: 0.45, reason: "fallback web search"});
        }

        proposals.sort((a, b) => b.confidence - a.confidence);
        return proposals;
    }

    private static _extract_urls(text: string): string[] {
        return (text || "").match(RoutingEngine.URL_RE) || [];
    }
}


export function default_rules_for_tools(tool_specs: any[]): Record<string, ToolRule> {
    const rules: Record<string, ToolRule> = {};
    const names = tool_specs.map(spec => spec.function.name);
    
    for (const name of names) {
        let safety = SafetyLevel.SAFE;
        let network = false;
        let rpm: number | undefined = undefined;
        let cooldown = 0.0;
        let arg_limits: Record<string, any> = {};

        if (name.startsWith("http_") || name === "search_web" || name.startsWith("e2b_browser_")) {
            network = true;
            rpm = 60;
            arg_limits = { timeout_sec: 30, max_results: 25 };
        }

        if (name === "run_python") {
            safety = SafetyLevel.SENSITIVE;
            rpm = 30;
            arg_limits = { timeout_sec: 30 };
        }

        if (name.startsWith("e2b_")) {
            safety = SafetyLevel.SENSITIVE;
            network = true;
            rpm = 30;
            if (name.includes("_remove_") || name.includes("_delete_")) {
                safety = SafetyLevel.ADMIN;
            }
            arg_limits = { ...arg_limits, timeout_sec: 120 };
        }

        rules[name] = {
            name: name,
            enabled: true,
            safety: safety,
            required_envs: [], // Not applicable in browser
            required_deps: [], // Not applicable in browser
            network: network,
            rpm_limit: rpm,
            cooldown_sec: cooldown,
            arg_limits: arg_limits
        };
    }
    return rules;
}