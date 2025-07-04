import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';

async function createDragosTestUser() {
  const storage = new DatabaseStorage();
  try {
    const existingUser = await storage.getUserByUsername('Dragos.Test');
    if (existingUser) {
      console.log('User Dragos.Test deja există!');
      return;
    }
    const newUser = await storage.createUser({
      username: 'Dragos.Test',
      email: 'dragos.test@cashpot.com',
      password: 'Dragos123',
      firstName: 'Dragos',
      lastName: 'Test',
      role: 'admin',
      isActive: true
    });
    console.log('Userul Dragos.Test a fost creat cu succes:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
    console.log('\nPoți face login cu:');
    console.log('Username: Dragos.Test');
    console.log('Parolă: Dragos123');
  } catch (error) {
    console.error('Eroare la crearea userului Dragos.Test:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

createDragosTestUser(); 