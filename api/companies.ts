import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  try {
    const client = await pool.connect();
    
    try {
      switch (method) {
        case 'GET':
          const page = parseInt(req.query.page as string) || 1;
          const limit = parseInt(req.query.limit as string) || 10;
          const offset = (page - 1) * limit;
          
          const countResult = await client.query('SELECT COUNT(*) FROM companies');
          const total = parseInt(countResult.rows[0].count);
          
          const result = await client.query(
            'SELECT * FROM companies ORDER BY id LIMIT $1 OFFSET $2',
            [limit, offset]
          );
          
          res.status(200).json({
            data: result.rows,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit)
            }
          });
          break;

        case 'POST':
          const { name, email, phone, address } = req.body;
          
          if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
          }
          
          const insertResult = await client.query(
            'INSERT INTO companies (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, phone, address]
          );
          
          res.status(201).json(insertResult.rows[0]);
          break;

        default:
          res.status(405).json({ message: 'Method not allowed' });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Companies error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 