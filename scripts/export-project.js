
/**
 * @fileOverview Node.js project exporter using archiver.
 * This script bundles the PLKAPK Hub source code into a ZIP file and places it in the public folder for easy download.
 */
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function exportProject() {
  // Save to public folder so it can be downloaded via the web server
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  const zipPath = path.join(publicDir, 'plkapk-hub-export.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', function() {
    console.log('\n----------------------------------------');
    console.log('SUCCESS: Project Exported to Public Folder');
    console.log('File: ' + zipPath);
    console.log('Download Link: http://localhost:9002/plkapk-hub-export.zip');
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
  archive.glob('**/*', {
    ignore: [
      'node_modules/**',
      '.next/**',
      'out/**',
      '.git/**',
      'public/plkapk-hub-export.zip', // Don't include the zip itself
      '**/.DS_Store'
    ],
    dot: true // Include hidden files
  });

  console.log('Compressing project files...');
  await archive.finalize();
}

exportProject();
