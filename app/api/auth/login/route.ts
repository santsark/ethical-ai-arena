import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({ tokensPerInterval: 5, interval: "minute" });

export async function POST(req: NextRequest) {
    if (await limiter.removeTokens(1) < 0) {
        return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // Fetch user from DB
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify Password
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            role: user.role
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
