#!/usr/bin/env node

/**
 * SkillHub — Setup Environment Variables
 * 
 * This script helps set up .env file for the server.
 * Copy .env.example to .env and fill in with your values.
 * 
 * Usage: node setup-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const serverDir = path.join(__dirname, '..', 'server');
const envExamplePath = path.join(serverDir, '.env.example');
const envPath = path.join(serverDir, '.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function setupEnv() {
  console.log('🚀 SkillHub — Environment Setup\n');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await prompt('.env file already exists. Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\nPlease fill in the following environment variables:\n');

  // Collect inputs
  const config = {
    NODE_ENV: await prompt('NODE_ENV (development/production) [development]: ') || 'development',
    PORT: await prompt('PORT [5000]: ') || '5000',
    DATABASE_URL: await prompt('DATABASE_URL (PostgreSQL connection string): '),
    GITHUB_CLIENT_ID: await prompt('GITHUB_CLIENT_ID (from GitHub OAuth Apps): '),
    GITHUB_CLIENT_SECRET: await prompt('GITHUB_CLIENT_SECRET: '),
    GITHUB_CALLBACK_URL: await prompt('GITHUB_CALLBACK_URL [http://localhost:5000/auth/github/callback]: ') || 'http://localhost:5000/auth/github/callback',
    YANDEXGPT_API_KEY: await prompt('YANDEXGPT_API_KEY (Yandex Cloud): '),
    YANDEXGPT_FOLDER_ID: await prompt('YANDEXGPT_FOLDER_ID (Yandex Cloud Folder ID): '),
    JWT_SECRET: await prompt('JWT_SECRET (strong random string) [auto-generate]: '),
    CLIENT_URL: await prompt('CLIENT_URL [http://localhost:5173]: ') || 'http://localhost:5173',
  };

  // Generate JWT_SECRET if not provided
  if (!config.JWT_SECRET) {
    const crypto = require('crypto');
    config.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.log(`  ✓ Generated JWT_SECRET`);
  }

  // Create .env content
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';

  // Write to file
  fs.writeFileSync(envPath, envContent);
  console.log(`\n✅ .env created successfully at ${envPath}`);
  console.log('   Next step: npm install && npm run dev (in server/)\n');

  rl.close();
}

// Run setup
setupEnv().catch(err => {
  console.error('❌ Error:', err);
  rl.close();
  process.exit(1);
});
