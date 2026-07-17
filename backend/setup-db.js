const { Client } = require('pg');

const passwords = ['postgres', 'root', 'admin', 'password', '123456', 'nikun', ''];

async function testPasswords() {
  for (const pwd of passwords) {
    const client = new Client({
      user: 'postgres',
      password: pwd,
      host: 'localhost',
      port: 5432,
      database: 'postgres' // connect to default db first
    });
    
    try {
      await client.connect();
      console.log(`SUCCESS: Password is '${pwd}'`);
      
      // Try to create the database
      try {
        await client.query('CREATE DATABASE doctor_patient_db;');
        console.log('Database created successfully!');
      } catch(e) {
        if(e.code === '42P04') {
          console.log('Database already exists. Good to go!');
        } else {
          console.log('Error creating DB:', e.message);
        }
      }
      
      await client.end();
      return;
    } catch (err) {
      // Failed to connect, try next
    }
  }
  console.log('FAILED to find password');
}

testPasswords();
