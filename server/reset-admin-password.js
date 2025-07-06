import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';

async function resetAdminPassword() {
  const storage = new DatabaseStorage();
  try {
    const user = await storage.getUserByUsername('admin');
    if (user) {
      await storage.updateUser(user.id, { password: 'admin123' });
      console.log('Parola pentru admin a fost resetată la admin123!');
    } else {
      console.log('Userul admin nu există!');
    }
  } catch (error) {
    console.error('Eroare la resetarea parolei admin:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

resetAdminPassword(); 