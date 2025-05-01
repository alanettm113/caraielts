const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'src');
const OLD_IMPORT = `@/lib/supabase/client`;
const NEW_IMPORT = `@/supabase/supabase`;

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(OLD_IMPORT)) {
    const updated = content.replaceAll(OLD_IMPORT, NEW_IMPORT);
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }
}

function walkDir(dirPath) {
  fs.readdirSync(dirPath).forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      updateImportsInFile(fullPath);
    }
  });
}

walkDir(TARGET_DIR);
