import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT NOW()');
            return NextResponse.json({
                status: 'healthy',
                time: result.rows[0].now,
                database: 'connected'
            });
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Database connection failed:', error);
        return NextResponse.json({
            status: 'unhealthy',
            error: error.message,
            database: 'disconnected'
        }, { status: 500 });
    }
}
