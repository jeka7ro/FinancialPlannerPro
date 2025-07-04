import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';

async function resetPasswords() {
  const storage = new DatabaseStorage();
  try {
    const usersToReset = [
      { username: 'Dragos.Test', password: 'Dragos123' },
      { username: 'Dragos.A', password: 'admin123' }
    ];
    for (const u of usersToReset) {
      const user = await storage.getUserByUsername(u.username);
      if (user) {
        await storage.updateUser(user.id, { password: u.password });
        console.log(`Parola pentru ${u.username} a fost resetată!`);
      } else {
        console.log(`Userul ${u.username} nu există!`);
      }
    }
  } catch (error) {
    console.error('Eroare la resetarea parolelor:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

resetPasswords(); 