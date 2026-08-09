import express from 'express';
import { apiRouter } from '../api-router';

const app = express();

// Since Vercel rewrites /api/(.*) to /api/index.ts, the path remains exactly as requested.
// We mount the router at the root of this app.
app.use(apiRouter);

export default app;
