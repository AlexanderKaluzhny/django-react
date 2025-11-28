/**
 * Vite Plugin: Move HTML to Django Templates
 *
 * This plugin moves the generated index.html file from the Vite build output
 * directory to the Django templates directory after the build completes.
 *
 * This matches the webpack behavior where HtmlWebpackPlugin outputs directly
 * to: ../djsrc/templates/react/index.html
 */

import fs from 'fs-extra';
import path from 'path';

export default function htmlToDjangoPlugin() {
  return {
    name: 'vite-plugin-html-to-django',

    // Hook that runs after the entire build is complete
    closeBundle() {
      const htmlSource = path.resolve(__dirname, '../djsrc/static/compiled/index.html');
      const htmlDest = path.resolve(__dirname, '../djsrc/templates/react/index.html');
      const destDir = path.dirname(htmlDest);

      try {
        // Ensure the destination directory exists
        fs.ensureDirSync(destDir);

        // Move the HTML file
        fs.moveSync(htmlSource, htmlDest, { overwrite: true });

        console.log('✓ Moved index.html to Django templates directory');
        console.log(`  From: ${htmlSource}`);
        console.log(`  To:   ${htmlDest}`);
      } catch (error) {
        console.error('✗ Failed to move index.html:', error.message);
        // Don't throw - let the build succeed even if move fails
        // This allows developers to debug the issue
      }
    },
  };
}
