
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
  console.log('STARTING PROJECT EXPORT');
  console.log('----------------------------------------');
  console.log(`Verifying source: Android folder is ${hasAndroid ? 'PRESENT' : 'MISSING'}`);
  
  if (!hasAndroid) {
    console.warn('WARNING: The "android" folder was not found in the root directory.');
    console.warn('It will be missing from the final ZIP unless created first.');
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

  // 1. Add essential root files individually
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
      console.log(`Adding file: ${file}`);
      archive.file(fullPath, { name: file });
    }
  });

  // 2. Add source and configuration directories
  const directories = [
    'src',
    'public',
    'android', // Explicitly including the android native project
    'docs',
    'scripts'
  ];

  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`Adding directory: ${dir}/**`);
      // Ensure the directory is added with its name to the zip root
      archive.directory(fullPath + '/', dir);
    } else {
      console.warn(`Skipping directory: ${dir} (Not found)`);
    }
  });

  console.log('\nFinalizing archive...');
  await archive.finalize();
}

exportProject();
