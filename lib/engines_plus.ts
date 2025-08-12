import {
  BudgetTotals,
  CacheStats,
  CallSpec,
  CallOutcome,
  ChargeRecord,
  MemoryEntry,
} from '../types';

/**
 * A stable stringifier for creating deterministic cache keys from objects.
 * It sorts keys before stringifying to ensure consistency.
 */
const stableJsonStringify = (obj: any): string => {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        return JSON.stringify(obj);
    }
    const keys = Object.keys(obj).sort();
    const pairs = keys.map(key => `"${key}":${stableJsonStringify(obj[key])}`);
    return `{${pairs.join(',')}}`;
};


/**
 * Tracks token usage and estimates costs.
 */
export class CostBudgetEngine {
    // Prices are per-million tokens, based on Gemini 1.5 Flash
    private price_in_per_m: number = 0.35; 
    private price_out_per_m: number = 1.05;
    
    public totals: BudgetTotals = { prompt_tokens: 0, completion_tokens: 0, cost_usd: 0.0 };
    public history: ChargeRecord[] = [];

    reset() {
        this.totals = { prompt_tokens: 0, completion_tokens: 0, cost_usd: 0.0 };
        this.history = [];
    }

    estimateCost(prompt_tokens: number, completion_tokens: number): number {
        return (prompt_tokens / 1e6) * this.price_in_per_m + (completion_tokens / 1e6) * this.price_out_per_m;
    }

    charge(prompt_tokens: number, completion_tokens: number, label?: string): ChargeRecord {
        const cost = this.estimateCost(prompt_tokens, completion_tokens);
        const rec: ChargeRecord = {
            at: new Date().toISOString(),
            prompt_tokens,
            completion_tokens,
            cost_usd: cost,
            label,
        };
        this.totals.prompt_tokens += rec.prompt_tokens;
        this.totals.completion_tokens += rec.completion_tokens;
        this.totals.cost_usd += rec.cost_usd;
        this.history.push(rec);
        return rec;
    }
}

/**
 * In-memory LRU cache with TTL for tool call results.
 */
export class CacheEngine {
    private max_entries: number;
    private ttl_sec: number;
    private _mem: Map<string, { ts: number, value: any }> = new Map();
    private _stats: CacheStats = { hits: 0, misses: 0, sets: 0, evictions: 0, entries: 0 };

    constructor(max_entries: number = 256, ttl_sec: number = 3600) {
        this.max_entries = max_entries;
        this.ttl_sec = ttl_sec;
    }

    makeKey(name: string, args: Record<string, any>): string {
        return stableJsonStringify({ name, args });
    }

    private _evict() {
        while (this._mem.size > this.max_entries) {
            const oldestKey = this._mem.keys().next().value;
            this._mem.delete(oldestKey);
            this._stats.evictions++;
        }
        this._stats.entries = this._mem.size;
    }

    get(key: string): any | null {
        const entry = this._mem.get(key);
        if (entry) {
            if (Date.now() - entry.ts > this.ttl_sec * 1000) {
                this._mem.delete(key);
                this._stats.misses++;
                this._stats.entries = this._mem.size;
                return null;
            }
            // Move to end to mark as recently used
            this._mem.delete(key);
            this._mem.set(key, entry);
            this._stats.hits++;
            return entry.value;
        }
        this._stats.misses++;
        return null;
    }

    set(key: string, value: any) {
        this._mem.set(key, { ts: Date.now(), value });
        this._stats.sets++;
        this._evict();
    }
    
    reset() {
        this._mem.clear();
        this._stats = { hits: 0, misses: 0, sets: 0, evictions: 0, entries: 0 };
    }

    stats(): CacheStats {
        return { ...this._stats, entries: this._mem.size };
    }

    async cachedCall(name: string, args: Record<string, any>, fn: () => Promise<any>): Promise<{ result: any, fromCache: boolean, ok: boolean, error?: string }> {
        const key = this.makeKey(name, args);
        const cachedValue = this.get(key);
        if (cachedValue !== null) {
            return { result: cachedValue, fromCache: true, ok: !cachedValue.error, error: cachedValue.error };
        }
        try {
            const result = await fn();
            // Ensure result is serializable before caching
            JSON.stringify(result);
            this.set(key, result);
            return { result, fromCache: false, ok: true };
        } catch (e: any) {
             const errorResult = { error: e.message || String(e) };
             this.set(key, errorResult); // Cache the error to prevent retries on persistent failures
             return { result: errorResult, fromCache: false, ok: false, error: errorResult.error };
        }
    }
}

/**
 * Executes multiple async functions concurrently.
 */
export class ParallelEngine {
    constructor(private max_workers: number = 6) {}

    async runMany(calls: CallSpec[]): Promise<CallOutcome[]> {
        const outcomes: CallOutcome[] = [];
        const callQueue = [...calls];
        
        const worker = async (): Promise<void> => {
            while (callQueue.length > 0) {
                const spec = callQueue.shift();
                if (!spec) continue;

                const t0 = Date.now();
                try {
                    // spec.fn is the cachedCall wrapper, which returns { result, fromCache }
                    const { result, fromCache } = await spec.fn();
                    outcomes.push({
                        name: spec.name,
                        ok: true,
                        duration_sec: (Date.now() - t0) / 1000,
                        result,
                        fromCache,
                    });
                } catch (e: any) {
                    outcomes.push({
                        name: spec.name,
                        ok: false,
                        duration_sec: (Date.now() - t0) / 1000,
                        result: null,
                        error: e.message || String(e),
                        fromCache: false,
                    });
                }
            }
        };

        const workers = Array(Math.min(this.max_workers, calls.length))
            .fill(0)
            .map(worker);
        
        await Promise.all(workers);
        return outcomes;
    }
}


/**
 * A simple text-based memory simulation. A real implementation would use vector embeddings.
 */
export class MemoryEngine {
    private entries: Map<string, { timestamp: string; text: string; keywords: Set<string> }> = new Map();

    private _extractKeywords(text: string): Set<string> {
        return new Set(
            text.toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 3) // Ignore very short words
        );
    }

    commit(text: string): { id: string, timestamp: string } {
        const id = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const timestamp = new Date().toISOString();
        const keywords = this._extractKeywords(text);
        this.entries.set(id, { timestamp, text, keywords });
        return { id, timestamp };
    }

    query(query: string, maxResults: number = 5): MemoryEntry[] {
        const queryKeywords = this._extractKeywords(query);
        if (queryKeywords.size === 0) return [];
        
        const scoredEntries = Array.from(this.entries.entries()).map(([id, entry]) => {
            const matchingKeywords = new Set([...entry.keywords].filter(k => queryKeywords.has(k)));
            const score = matchingKeywords.size / queryKeywords.size;
            return { id, ...entry, score };
        });

        return scoredEntries
            .filter(e => e.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);
    }

    getAll(): MemoryEntry[] {
        return Array.from(this.entries.entries()).map(([id, { timestamp, text }]) => ({ id, timestamp, text })).reverse();
    }
    
    clear() {
        this.entries.clear();
    }
}