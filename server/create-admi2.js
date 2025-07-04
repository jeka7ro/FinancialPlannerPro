import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';

async function createAdmi2User() {
  const storage = new DatabaseStorage();
  
  try {
    console.log('=== CREATE ADMI2 USER ===');
    
    // Check if admi2 user already exists
    const existingUser = await storage.getUserByUsername('admi2');
    
    if (existingUser) {
      console.log('User "admi2" already exists!');
      console.log('ID:', existingUser.id);
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      return;
    }

    // Create admi2 user
    const newUser = await storage.createUser({
      username: 'admi2',
      email: 'admi2@cashpot.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User 2',
      role: 'admin',
      isActive: true
    });

    console.log('User "admi2" created successfully:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
    
    console.log('\nYou can now login with:');
    console.log('Username: admi2');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admi2 user:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

createAdmi2User(); 