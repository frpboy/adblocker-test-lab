// Vercel serverless function: GET returns the public totals; POST { event: 'visit' | 'test' }
// adds one. See ./_counter-core.js for the rules and the privacy boundary.
import { neon } from '@neondatabase/serverless';
import { handleCounterRequest } from './_counter-core.js';

const connectionString = process.env.COUNTER_DATABASE_URL;
const sql = connectionString ? neon(connectionString) : null;

export default async function handler(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }

  const result = await handleCounterRequest({
    method: req.method,
    origin: req.headers.origin,
    body,
    sql
  });

  for (const [name, value] of Object.entries(result.headers || {})) res.setHeader(name, value);
  res.status(result.status).json(result.body);
}
