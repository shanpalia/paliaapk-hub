
/**
 * @fileOverview Node.js project exporter using archiver.
 * This script bundles the PLKAPK Hub source code (including Android native project) 
 * into a ZIP file and places it in the root folder for easy download.
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function exportProject() {
  const zipPath = path.join(process.cwd(), 'plkapk-hub-export.zip');
  
  // Pre-verification check
  const androidPath = path.join(process.cwd(), 'android');
  const hasAndroid = fs.existsSync(androidPath);
  
  console.log('----------------------------------------');
  console.log('STARTING PROJECT EXPORT PROTOCOL');
  console.log('----------------------------------------');
  console.log(`Verifying source: Android folder is ${hasAndroid ? 'PRESENT' : 'MISSING'}`);
  
  if (!hasAndroid) {
    console.error('ERROR: The "android" folder was not found. Please run "npx cap add android" first.');
  }

  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', function() {
    console.log('\n----------------------------------------');
    console.log('SUCCESS: Project Exported');
    console.log('File: ' + zipPath);
    console.log('Size: ' + (archive.pointer() / 1024 / 1024).toFixed(2) + ' MB');
    console.log('\nTO DOWNLOAD TO YOUR COMPUTER:');
    console.log('1. Find "plkapk-hub-export.zip" in the left sidebar.');
    console.log('2. Right-click and select "Download".');
    console.log('3. Unzip and open the "android" folder in Android Studio.');
    console.log('----------------------------------------\n');
  });

  archive.on('error', function(err) {
    console.error('Archiver Error:', err);
    process.exit(1);
  });

  archive.pipe(output);

  // Add root configuration files
  const rootFiles = [
    'package.json',
    'capacitor.config.ts',
    'next.config.ts',
    'tailwind.config.ts',
    'tsconfig.json',
    'apphosting.yaml',
    'components.json',
    'README.md',
    '.env'
  ];

  rootFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      archive.file(fullPath, { name: file });
    }
  });

  // Add critical directories
  const directories = ['src', 'public', 'android', 'docs', 'scripts'];

  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`Injecting directory: ${dir}`);
      archive.directory(fullPath + '/', dir);
    }
  });

  await archive.finalize();
}

exportProject();
