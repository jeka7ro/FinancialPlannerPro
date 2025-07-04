import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';
import bcrypt from 'bcryptjs';

async function debugUsers() {
  const storage = new DatabaseStorage();
  
  try {
    console.log('=== DEBUG USERS ===');
    
    // Get all users
    const result = await storage.getUsers(1, 100, "");
    console.log(`Total users found: ${result.total}`);
    
    for (const user of result.users) {
      console.log('\n--- User ---');
      console.log(`ID: ${user.id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Is Active: ${user.isActive}`);
      console.log(`Password length: ${user.password.length}`);
      console.log(`Password starts with $2b$: ${user.password.startsWith('$2b$')}`);
      console.log(`Password hash: ${user.password.substring(0, 20)}...`);
      
      // Test password authentication
      const testPasswords = ['admin123', 'password', 'test123'];
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`Password "${testPassword}" valid: ${isValid}`);
      }
      
      // Test with storage.authenticateUser
      const authResult = await storage.authenticateUser(user.username, 'admin123');
      console.log(`Storage auth with admin123: ${authResult ? 'SUCCESS' : 'FAILED'}`);
    }
    
  } catch (error) {
    console.error('Error debugging users:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

debugUsers(); 