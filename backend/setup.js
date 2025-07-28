#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 AttendEase Backend Setup\n');

// Check if config.env already exists
const configPath = path.join(__dirname, 'config.env');
if (fs.existsSync(configPath)) {
  console.log('⚠️  config.env already exists. Do you want to overwrite it? (y/N)');
  rl.question('', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      runSetup();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  runSetup();
}

function runSetup() {
  console.log('Please provide the following information:\n');

  rl.question('Gmail address (for sending OTP): ', (email) => {
    rl.question('Gmail app password: ', (password) => {
      rl.question('JWT secret (or press Enter for auto-generated): ', (jwtSecret) => {
        rl.question('Server port (default: 5000): ', (port) => {
          // Generate JWT secret if not provided
          if (!jwtSecret) {
            jwtSecret = require('crypto').randomBytes(64).toString('hex');
          }

          // Use default port if not provided
          if (!port) {
            port = '5000';
          }

          const configContent = `# Email Configuration (Gmail)
EMAIL_USER=${email}
EMAIL_PASS=${password}

# JWT Secret
JWT_SECRET=${jwtSecret}

# Server Configuration
PORT=${port}
NODE_ENV=development
`;

          try {
            fs.writeFileSync(configPath, configContent);
            console.log('\n✅ Configuration file created successfully!');
            console.log('\n📝 Next steps:');
            console.log('1. Install dependencies: npm install');
            console.log('2. Start the server: npm run dev');
            console.log('3. Test the API: http://localhost:' + port + '/api/health');
            console.log('\n⚠️  Important:');
            console.log('- Make sure your Gmail has 2FA enabled');
            console.log('- Use an app password, not your regular password');
            console.log('- Keep your JWT_SECRET secure and private');
          } catch (error) {
            console.error('❌ Error creating config file:', error.message);
          }

          rl.close();
        });
      });
    });
  });
} 