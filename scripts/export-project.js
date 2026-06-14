/**
 * @fileOverview Node.js project exporter using archiver.
 * This script bundles the PLKAPK Hub source code into a ZIP file for easy distribution.
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
    console.log('Size: ' + (archive.pointer() / 1024 / 1024).toFixed(2) + ' MB');
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
  // Excludes node_modules, .next, and the output zip itself to avoid recursion
  archive.glob('**/*', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'out/**',
      '.git/**',
      'plkapk-hub-export.zip',
      '**/.DS_Store'
    ],
    dot: true // Include hidden files like .env templates
  });

  console.log('Compressing project files...');
  await archive.finalize();
}

exportProject();