/**
 * ===============================================================
 * Gemini Neural Swarm UI - Server Session Manager
 * ===============================================================
 *
 * This module manages the state for each user session on the server.
 * Each session gets its own set of engines, sandbox instance, and memory.
 */
import { Sandbox } from '@e2b/sdk';
import initSqlJs, { Database } from 'sql.js';
import { NetworkLogEntry } from '../types';
import { GatingEngine, default_rules_for_tools } from '../lib/engines';
import { CostBudgetEngine, CacheEngine, ParallelEngine, MemoryEngine } from '../lib/engines_plus';
import { InMemoryFileSystem } from '../lib/in-memory-fs';
import { ALL_TOOLS } from '../tools';

// SQL.js Initialization
let SQL: any = null;
initSqlJs().then(sql => {
    SQL = sql;
    console.log("sql.js initialized successfully.");
}).catch(e => {
    console.error("Failed to initialize sql.js. Database features will be unavailable.", e);
});

export interface ServerSession {
  id: string;
  sandbox: Sandbox | null;
  fs: InMemoryFileSystem;
  gatingEngine: GatingEngine;
  costBudgetEngine: CostBudgetEngine;
  cacheEngine: CacheEngine;
  parallelEngine: ParallelEngine;
  memoryEngine: MemoryEngine;
  networkLog: NetworkLogEntry[];
  isInterrupted: boolean;
  db: Database | null;
}

const sessions = new Map<string, ServerSession>();

export async function getOrCreateServerSession(sessionId: string): Promise<ServerSession> {
  if (sessions.has(sessionId)) {
    return sessions.get(sessionId)!;
  }

  const allToolSpecs = ALL_TOOLS.map(t => ({ function: t }));
  const rules = default_rules_for_tools(allToolSpecs);
  
  if (!SQL) {
      throw new Error("sql.js is not initialized. Cannot create a database session.");
  }
  const db = new SQL.Database();

  const newSession: ServerSession = {
    id: sessionId,
    sandbox: null,
    fs: new InMemoryFileSystem(),
    gatingEngine: new GatingEngine(allToolSpecs, undefined, rules),
    costBudgetEngine: new CostBudgetEngine(),
    cacheEngine: new CacheEngine(),
    parallelEngine: new ParallelEngine(),
    memoryEngine: new MemoryEngine(),
    networkLog: [],
    isInterrupted: false,
    db,
  };

  sessions.set(sessionId, newSession);
  return newSession;
}
