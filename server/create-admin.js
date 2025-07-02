import 'dotenv/config';
import { DatabaseStorage } from './storage.ts';

async function createAdminUser() {
  const storage = new DatabaseStorage();
  
  try {
    // Check if admin user already exists
    const existingUser = await storage.getUserByUsername('admin');
    
    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const newUser = await storage.createUser({
      username: 'admin',
      email: 'admin@cashpot.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });

    console.log('Admin user created successfully:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
    
    console.log('\nYou can now login with:');
    console.log('Username: admin');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    if (storage.pool) {
      await storage.pool.end();
    }
  }
}

createAdminUser(); 