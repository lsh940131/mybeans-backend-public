import { execSync } from 'child_process';

const target = process.argv[2];

if (!target) {
  console.error('❌ 실행할 파일명을 입력하세요. 예: npm run script init-category');
  process.exit(1);
}

const fullPath = `./script/${target}/index.ts`;

try {
  console.log(`🚀 실행: ${fullPath}`);
  execSync(`ts-node --project tsconfig.build.json ${fullPath}`, { stdio: 'inherit' });
} catch (err) {
  console.error('❌ 오류 발생:', err);
  process.exit(1);
}
