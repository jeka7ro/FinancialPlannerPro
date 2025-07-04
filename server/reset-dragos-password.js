import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';

async function resetPassword() {
  const storage = new DatabaseStorage();
  try {
    const user = await storage.getUserByUsername('Dragos.A');
    if (!user) {
      console.log('User Dragos.A nu există!');
      return;
    }
    await storage.updateUser(user.id, { password: 'admin123' });
    console.log('Parola pentru Dragos.A a fost resetată la admin123!');
  } catch (error) {
    console.error('Eroare la resetarea parolei:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

resetPassword(); 