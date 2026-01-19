import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Fetch all logs (for Admin Dashboard)
export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM experiment_logs ORDER BY timestamp DESC LIMIT 100'
      );

      // Map DB snake_case to our App's camelCase if necessary, 
      // but we structured the table to hold JSONB, so mapping is minimal.
      const logs = result.rows.map(row => ({
        timestamp: row.timestamp,
        sessionId: row.session_id,
        question: row.question,
        responses: row.responses,
        judgments: row.judgments,
        status: row.status,
        errorMessage: row.error_message
      }));

      return NextResponse.json(logs);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Database Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

// POST: Save a new experiment log
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, question, responses, judgments, status, errorMessage } = body;

    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO experiment_logs (session_id, question, responses, judgments, status, error_message)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const values = [
        sessionId,
        question,
        JSON.stringify(responses), // Ensure JSONB compatibility
        JSON.stringify(judgments),
        status,
        errorMessage
      ];

      await client.query(query, values);

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Database Insert Error:", error);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}