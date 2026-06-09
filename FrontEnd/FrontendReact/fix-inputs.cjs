const fs = require('fs');
const path = require('path');

const dirs = [
  'src/pages/admin',
  'src/pages/captain',
  'src/pages/common',
  'src/pages/owner',
  'src/pages/player',
  'src/pages',
  'src/components',
];

// Fix input/select/textarea elements that have bg but missing text color for dark mode
// Pattern: has dark:bg-slate-XXX but no dark:text-white or dark:text-slate-XXX on the same line
const rules = [
  // Fix inputs with bg-slate-50 dark:bg-slate-900 but missing text color
  {
    find: /bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded(?!.*dark:text-)/g,
    replace: 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded'
  },
  // Fix inputs with bg-white dark:bg-slate-800 but missing text color (only for form elements)
  {
    find: /bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus(?!.*dark:text-)/g,
    replace: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus'
  },
  // Fix role badges: bg-slate-100 without proper dark bg
  {
    find: /bg-slate-100 text-slate-600(?! dark:bg)/g,
    replace: 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200'
  },
  // Fix inputs with bg-slate-50 dark:bg-slate-800 but missing text color
  {
    find: /bg-slate-50 dark:bg-slate-800 border border-slate-200(?!.*dark:text-white)(?!.*dark:text-slate)/g,
    replace: 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200'
  },
];

let totalFiles = 0;
let totalChanges = 0;
const baseDir = process.cwd();
const processedFiles = new Set();

for (const dir of dirs) {
  const fullDir = path.join(baseDir, dir);
  if (!fs.existsSync(fullDir)) continue;
  
  const entries = fs.readdirSync(fullDir).filter(f => f.endsWith('.jsx') || f.endsWith('.js'));
  
  for (const file of entries) {
    const filePath = path.join(fullDir, file);
    
    // Skip if already processed (pages dir may overlap with subdirs)
    if (processedFiles.has(filePath)) continue;
    processedFiles.add(filePath);
    
    // Skip directories
    if (fs.statSync(filePath).isDirectory()) continue;
    
    const original = fs.readFileSync(filePath, 'utf8');
    let content = original;
    
    for (const rule of rules) {
      content = content.replace(rule.find, rule.replace);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      const changeCount = original.split('\n').filter((line, i) => line !== content.split('\n')[i]).length;
      console.log(`✅ ${dir}/${file} - ${changeCount} lines changed`);
      totalChanges += changeCount;
      totalFiles++;
    }
  }
}

console.log(`\nDone! ${totalFiles} files modified, ${totalChanges} total line changes.`);
