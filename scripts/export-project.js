
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
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', function() {
    console.log('\n----------------------------------------');
    console.log('SUCCESS: Project Exported with Android Assets');
    console.log('File: ' + zipPath);
    console.log('Size: ' + (archive.pointer() / 1024 / 1024).toFixed(2) + ' MB');
    console.log('\nTO DOWNLOAD TO YOUR COMPUTER:');
    console.log('1. Find "plkapk-hub-export.zip" in the left sidebar (File Explorer).');
    console.log('2. Right-click the file and select "Download".');
    console.log('----------------------------------------\n');
  });

  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn('Archiver Warning:', err);
    } else {
      throw err;
    }
  });

  archive.on('error', function(err) {
    console.error('Archiver Error:', err);
    process.exit(1);
  });

  archive.pipe(output);

  // 1. Add essential root files
  const rootFiles = [
    'package.json',
    'package-lock.json',
    'capacitor.config.ts',
    'next.config.ts',
    'tailwind.config.ts',
    'tsconfig.json',
    'apphosting.yaml',
    'components.json',
    'README.md',
    '.env',
    'dev.nix'
  ];

  rootFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      archive.file(file, { name: file });
    }
  });

  // 2. Add source and configuration directories
  const directories = [
    'src',
    'public',
    'android', // Explicitly include the entire android native project
    'docs',
    'scripts'
  ];

  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`Adding directory: ${dir}...`);
      archive.directory(dir + '/', dir);
    }
  });

  console.log('Compressing project files (this may take a moment)...');
  await archive.finalize();
}

exportProject();
