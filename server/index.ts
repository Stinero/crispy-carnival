/**
 * ===============================================================
 * Gemini Neural Swarm UI - Backend Server Entry Point
 * ===============================================================
 *
 * This file sets up and starts the Express web server.
 */
import express from 'express';
import cors from 'cors';
import apiRouter from './router';
import { E2B_API_KEY } from './env';

const app = express();
const port = 3001; 

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', apiRouter);

app.listen(port, () => {
    console.log(`Neural Swarm Backend listening on port ${port}`);
    if(!process.env.GEMINI_API_KEY) console.warn("WARNING: GEMINI_API_KEY is not set. The server will not function correctly.");
    if(!process.env.E2B_API_KEY && E2B_API_KEY.includes("YOUR_E2B_API_KEY_HERE")) console.warn("WARNING: E2B_API_KEY is not set. Sandbox tools will be disabled.");
});