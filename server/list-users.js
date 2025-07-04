import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';

async function listUsers() {
  const storage = new DatabaseStorage();
  try {
    const { users } = await storage.getUsers(1, 100);
    console.log('=== USERS IN DATABASE ===');
    users.forEach(u => {
      console.log(`ID: ${u.id} | Username: ${u.username} | Email: ${u.email} | Role: ${u.role}`);
    });
    if (users.length === 0) {
      console.log('No users found!');
    }
  } catch (error) {
    console.error('Eroare la listarea userilor:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

listUsers(); 