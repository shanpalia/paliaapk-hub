
/**
 * @fileOverview Node.js project exporter using archiver.
 * This script bundles the PLKAPK Hub source code into a ZIP file and places it in the root folder for easy download via the IDE sidebar.
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
    console.log('SUCCESS: Project Exported');
    console.log('File: ' + zipPath);
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

  // Glob patterns to include/exclude
  archive.glob('**/*', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'out/**',
      '.git/**',
      'plkapk-hub-export.zip', // Don't include the zip itself
      '**/.DS_Store'
    ],
    dot: true // Include hidden files
  });

  console.log('Compressing project files...');
  await archive.finalize();
}

exportProject();
