#!/usr/bin/env node

/**
 * SkillHub — Check Environment Variables
 * 
 * Verifies that all required environment variables are set.
 * 
 * Usage: node check-env.js
 */

const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, '..', 'server');
const envPath = path.join(serverDir, '.env');

// Required variables for MVP
const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_CALLBACK_URL',
  'YANDEXGPT_API_KEY',
  'YANDEXGPT_FOLDER_ID',
  'CLIENT_URL',
];

// Optional variables
const OPTIONAL_VARS = [
  'CLIENT_URLS',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'GITHUB_API_TOKEN',
  'DEBUG',
  'LOG_LEVEL',
];

console.log('🔍 SkillHub — Checking Environment Variables\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  console.log('\nℹ️  Create it by running:');
  console.log('   node scripts/setup-env.js\n');
  process.exit(1);
}

// Parse .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    envVars[key] = value;
  }
});

// Check required variables
console.log('📋 Checking REQUIRED variables:\n');
let allRequiredSet = true;

REQUIRED_VARS.forEach(varName => {
  const value = envVars[varName];
  if (!value || value === '') {
    console.log(`  ❌ ${varName.padEnd(30)} - NOT SET`);
    allRequiredSet = false;
  } else {
    const displayValue = value.length > 40 ? value.substring(0, 37) + '...' : value;
    console.log(`  ✅ ${varName.padEnd(30)} - ${displayValue}`);
  }
});

// Check optional variables
console.log('\n📋 Checking OPTIONAL variables:\n');

OPTIONAL_VARS.forEach(varName => {
  const value = envVars[varName];
  if (!value || value === '') {
    console.log(`  ⚠️  ${varName.padEnd(30)} - not set (optional)`);
  } else {
    const displayValue = value.length > 40 ? value.substring(0, 37) + '...' : value;
    console.log(`  ✅ ${varName.padEnd(30)} - ${displayValue}`);
  }
});

// Summary
console.log('\n' + '='.repeat(70));
if (allRequiredSet) {
  console.log('✅ All required variables are set!');
  console.log('\n📌 Next steps:');
  console.log('   1. cd server');
  console.log('   2. npm install');
  console.log('   3. npm run dev\n');
} else {
  console.log('❌ Some required variables are missing.');
  console.log('\n📌 To set them:');
  console.log('   1. Edit server/.env');
  console.log('   2. Fill in all required values');
  console.log('   3. Run: node scripts/check-env.js\n');
  process.exit(1);
}
