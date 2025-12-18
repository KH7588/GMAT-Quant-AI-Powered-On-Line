const fs = require('fs');
const path = require('path');

const examsDir = path.join(__dirname, '..', 'data', 'exams');
let changesMade = false;

console.log('Linting exam files...');

try {
  // Check if directory exists first to prevent crashes
  if (!fs.existsSync(examsDir)) {
    console.log('  Data/exams directory not found. Skipping linting (this is fine if you are using AI generation only).');
  } else {
    const files = fs.readdirSync(examsDir);

    for (const file of files) {
      if (file.endsWith('.ts')) {
        const filePath = path.join(examsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Skip empty files to avoid errors
        if (!content || content.trim() === '') {
            continue;
        }

        const originalContent = content;

        // Fix 1: Ensure import path for 'questions' does not have a .ts extension
        content = content.replace(/'\.\.\/questions\.ts'/g, "'../questions'");

        // Fix 2: Escape standalone dollar signs followed by a number to prevent MathJax errors
        content = content.replace(/(?<!\\)\$(\d)/g, '\\\\$$$1');
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`  - Fixed formatting in ${file}`);
          changesMade = true;
        }
      }
    }

    if (!changesMade) {
      console.log('All exam files are correctly formatted. No changes needed.');
    } else {
      console.log('Formatting fixes applied successfully.');
    }
  }

} catch (error) {
  console.error('Error while linting exam files:', error);
  // Do not exit process here, just log error, so build can continue
  // process.exit(1); 
}