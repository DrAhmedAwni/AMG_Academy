import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup() {
  const apiDir = path.resolve(__dirname, '../../api');
  
  console.log('Running E2E database seed...');
  
  try {
    const output = execSync(
      'npx ts-node --transpile-only prisma/e2e-seed.ts',
      {
        cwd: apiDir,
        encoding: 'utf-8',
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amg_academy_dev',
        },
      },
    );

    const lines = output.trim().split('\n');
    const jsonLine = lines.find(l => l.trim().startsWith('{'));
    
    if (jsonLine) {
      const seedData = JSON.parse(jsonLine);
      
      const tempDir = path.resolve(__dirname, '../.playwright');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFileSync(
        path.join(tempDir, 'seed-data.json'),
        JSON.stringify(seedData, null, 2),
      );
      
      console.log('E2E seed completed');
    }
  } catch (error) {
    console.error('E2E seed failed:', error);
    throw error;
  }
}

export default globalSetup;
