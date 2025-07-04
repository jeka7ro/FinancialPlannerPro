import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';

async function createDragosUser() {
  const storage = new DatabaseStorage();
  
  try {
    console.log('=== CREATE DRAGOS.A USER ===');
    
    // Check if Dragos.A user already exists
    const existingUser = await storage.getUserByUsername('Dragos.A');
    
    if (existingUser) {
      console.log('User "Dragos.A" already exists!');
      console.log('ID:', existingUser.id);
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      return;
    }

    // Create Dragos.A user
    const newUser = await storage.createUser({
      username: 'Dragos.A',
      email: 'dragos@cashpot.com',
      password: 'admin123', // You can change this password
      firstName: 'Dragos',
      lastName: 'Admin',
      role: 'admin',
      isActive: true
    });

    console.log('User "Dragos.A" created successfully:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
    
    console.log('\nYou can now login with:');
    console.log('Username: Dragos.A');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating Dragos.A user:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

createDragosUser(); 