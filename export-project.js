#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('CASHPOT Gaming System - Project Export Summary');
console.log('==============================================');

// Check if all deployment files exist
const deploymentFiles = [
  'README.md',
  'DEPLOYMENT.md',
  'package.json',
  '.env.example',
  'docker-compose.yml',
  'Dockerfile',
  'LICENSE',
  'railway-deployment-guide.md',
  'github-push-commands.md'
];

console.log('\n✅ Deployment Files Status:');
deploymentFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ✗ ${file} - MISSING`);
  }
});

// Check application structure
const appDirs = ['client', 'server', 'shared'];
console.log('\n✅ Application Structure:');
appDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir, { recursive: true }).length;
    console.log(`   ✓ ${dir}/ (${files} files)`);
  } else {
    console.log(`   ✗ ${dir}/ - MISSING`);
  }
});

console.log('\n🚀 Next Steps:');
console.log('1. Create GitHub repository: https://github.com/jeka7ro/cashpot-gaming-system');
console.log('2. Upload project files to GitHub');
console.log('3. Deploy to Railway using the deployment guide');
console.log('\n📋 Repository Description:');
console.log('Comprehensive gaming management system for ONJN reporting and compliance');
console.log('\n🔗 Ready for deployment with Railway, Docker, or traditional VPS hosting');