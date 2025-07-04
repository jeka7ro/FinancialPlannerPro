import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';
import bcrypt from 'bcryptjs';

async function debugSpecificUser() {
  const storage = new DatabaseStorage();
  
  try {
    console.log('=== DEBUG SPECIFIC USER ===');
    
    // Check for admi2 user
    const user = await storage.getUserByUsername('admi2');
    
    if (!user) {
      console.log('User "admi2" not found!');
      return;
    }
    
    console.log('\n--- User admi2 ---');
    console.log(`ID: ${user.id}`);
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Is Active: ${user.isActive}`);
    console.log(`Password length: ${user.password.length}`);
    console.log(`Password starts with $2b$: ${user.password.startsWith('$2b$')}`);
    console.log(`Password hash: ${user.password.substring(0, 20)}...`);
    
    // Test password authentication
    const testPasswords = ['admin123', 'password', 'test123', 'admi2'];
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`Password "${testPassword}" valid: ${isValid}`);
    }
    
    // Test with storage.authenticateUser
    const authResult = await storage.authenticateUser(user.username, 'admin123');
    console.log(`Storage auth with admin123: ${authResult ? 'SUCCESS' : 'FAILED'}`);
    
  } catch (error) {
    console.error('Error debugging user:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

debugSpecificUser(); 