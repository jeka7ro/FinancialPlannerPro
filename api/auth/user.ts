import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const sessionId = req.cookies?.session;

    if (!sessionId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, username, email, first_name, last_name, role FROM users WHERE id = $1',
        [sessionId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid session' });
      }

      const user = result.rows[0];
      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 