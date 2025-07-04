import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';
import bcrypt from 'bcryptjs';

async function debugDragosUser() {
  const storage = new DatabaseStorage();
  
  try {
    console.log('=== DEBUG DRAGOS.A USER ===');
    
    // Check for Dragos.A user
    const user = await storage.getUserByUsername('Dragos.A');
    
    if (!user) {
      console.log('User "Dragos.A" not found!');
      return;
    }
    
    console.log('\n--- User Dragos.A ---');
    console.log(`ID: ${user.id}`);
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Is Active: ${user.isActive}`);
    console.log(`Created At: ${user.createdAt}`);
    console.log(`Updated At: ${user.updatedAt}`);
    console.log(`Password length: ${user.password.length}`);
    console.log(`Password starts with $2b$: ${user.password.startsWith('$2b$')}`);
    console.log(`Password hash: ${user.password.substring(0, 20)}...`);
    
    // Test common passwords
    const testPasswords = ['admin123', 'password', 'test123', 'dragos', 'Dragos', 'dragos123', 'Dragos123'];
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`Password "${testPassword}" valid: ${isValid}`);
    }
    
    // Test with storage.authenticateUser
    const authResult = await storage.authenticateUser(user.username, 'admin123');
    console.log(`Storage auth with admin123: ${authResult ? 'SUCCESS' : 'FAILED'}`);
    
    // Check if password might be plaintext (not hashed)
    if (!user.password.startsWith('$2b$')) {
      console.log('\n⚠️  WARNING: Password is not hashed! This is a security issue.');
      console.log('Password appears to be stored as plaintext.');
    }
    
  } catch (error) {
    console.error('Error debugging Dragos.A user:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

debugDragosUser(); 