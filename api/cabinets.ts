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
          const search = req.query.search as string || '';
          const offset = (page - 1) * limit;
          
          let whereClause = '';
          let params = [limit, offset];
          
          if (search) {
            whereClause = 'WHERE name ILIKE $3 OR serial_number ILIKE $3';
            params = [limit, offset, `%${search}%`];
          }
          
          const countResult = await client.query(
            `SELECT COUNT(*) FROM cabinets ${whereClause}`,
            search ? [`%${search}%`] : []
          );
          const total = parseInt(countResult.rows[0].count);
          
          const result = await client.query(
            `SELECT * FROM cabinets ${whereClause} ORDER BY id LIMIT $1 OFFSET $2`,
            params
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
          const { name, serial_number, location_id, company_id, status } = req.body;
          
          if (!name || !serial_number) {
            return res.status(400).json({ message: 'Name and serial number are required' });
          }
          
          const insertResult = await client.query(
            'INSERT INTO cabinets (name, serial_number, location_id, company_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, serial_number, location_id, company_id, status]
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
    console.error('Cabinets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 