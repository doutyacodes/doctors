// Test database connection
import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST || '68.178.163.247');
    console.log('User:', process.env.DB_USER || 'devuser_doctors');
    console.log('Database:', process.env.DB_NAME || 'devuser_doctors');
    console.log('Port:', process.env.DB_PORT || '3306');

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '68.178.163.247',
      user: process.env.DB_USER || 'devuser_doctors',
      password: process.env.DB_PASSWORD || 'Wowfy#user',
      database: process.env.DB_NAME || 'devuser_doctors',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('✅ Connection successful!');

    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);

    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables in database:', tables);

    await connection.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL State:', error.sqlState);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 SOLUTION: The database server is blocking your IP address (68.178.163.247)');
      console.log('Please contact your database administrator to:');
      console.log('1. Add your IP address (68.178.163.247) to the allowed hosts');
      console.log('2. Or enable remote access for this database user');
      console.log('3. Or check if the password is correct');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('\n🔧 SOLUTION: Cannot reach the database server');
      console.log('1. Check if the host address is correct');
      console.log('2. Check if the database server is running');
      console.log('3. Check firewall settings');
    }
  }
}

testConnection();
