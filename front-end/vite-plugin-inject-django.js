/**
 * Vite Plugin: Inject built assets into Django HTML templates.
 *
 * After Vite finishes building, this plugin:
 * 1. Reads .vite/manifest.json to discover hashed JS/CSS filenames
 * 2. For each entry point, collects all CSS (including from shared chunks)
 * 3. Reads the source HTML template from front-end/html-templates/
 * 4. Replaces %PUBLIC_URL% with the Vite base path
 * 5. Injects <link> tags before </head> and <script> tags before </body>
 * 6. Writes the result to the Django templates directory
 *
 * Django template syntax ({{ }}, {% %}) passes through untouched.
 */

import fs from 'fs-extra';
import path from 'path';

const ENTRY_TO_TEMPLATE = {
  mainApp:      { src: 'index.html', dest: 'index.html' },
  demoMicroApp: { src: 'demo.html',  dest: 'demo.html' },
};

// Map entry names to their source file paths (must match rollupOptions.input keys)
const ENTRY_TO_SOURCE = {
  mainApp:      'src/index.jsx',
  demoMicroApp: 'src/micro-apps/demo/index.js',
};

/**
 * Recursively collect all CSS files from an entry and its imports.
 */
function collectCss(manifest, key, visited = new Set()) {
  if (visited.has(key)) return [];
  visited.add(key);

  const entry = manifest[key];
  if (!entry) return [];

  const cssFiles = [...(entry.css || [])];
  for (const imp of entry.imports || []) {
    cssFiles.push(...collectCss(manifest, imp, visited));
  }
  return cssFiles;
}

/**
 * @param {object} options
 * @param {string} options.mode - Vite build mode ('development' or 'production')
 */
export function injectAssetsIntoDjangoTemplates({ mode }) {
  const basePath = '/static/compiled/';
  const templatesDir = path.resolve(__dirname, 'html-templates');
  const outTemplatesDir = path.resolve(__dirname, '../djsrc/templates/react');
  const buildOutDir = path.resolve(__dirname, '../djsrc/static/compiled');

  return {
    name: 'vite-plugin-inject-django',

    closeBundle() {
      const manifestPath = path.join(buildOutDir, '.vite', 'manifest.json');

      if (!fs.existsSync(manifestPath)) {
        console.error('✗ Manifest not found at', manifestPath);
        return;
      }

      const manifest = fs.readJsonSync(manifestPath);
      fs.ensureDirSync(outTemplatesDir);

      let successCount = 0;
      const perEntry = [];

      for (const [entryName, { src, dest }] of Object.entries(ENTRY_TO_TEMPLATE)) {
        const templatePath = path.join(templatesDir, src);

        if (!fs.existsSync(templatePath)) {
          console.error(`✗ Template not found: ${templatePath}`);
          continue;
        }

        const sourceKey = ENTRY_TO_SOURCE[entryName];
        const manifestEntry = manifest[sourceKey];

        if (!manifestEntry) {
          console.error(`✗ Manifest entry not found for "${sourceKey}" (entry: ${entryName})`);
          continue;
        }

        // Collect assets
        const jsFile = manifestEntry.file;
        const uniqueCss = [...new Set(collectCss(manifest, sourceKey))];

        // Build tags
        const linkTags = uniqueCss
          .map(css => `    <link rel="stylesheet" href="${basePath}${css}">`)
          .join('\n');
        const scriptTag = `    <script type="module" src="${basePath}${jsFile}"></script>`;

        // Read template and process
        let html = fs.readFileSync(templatePath, 'utf-8');
        html = html.replace(/%PUBLIC_URL%/g, basePath.replace(/\/$/, ''));

        // Inject CSS before </head>
        if (linkTags) {
          html = html.replace('</head>', `${linkTags}\n  </head>`);
        }

        // Inject JS before </body>
        html = html.replace('</body>', `${scriptTag}\n  </body>`);

        // Write to Django templates directory
        const outputPath = path.join(outTemplatesDir, dest);
        fs.writeFileSync(outputPath, html, 'utf-8');

        perEntry.push({ name: entryName, js: jsFile, css: uniqueCss.length });
        successCount++;
      }

      // Per-entry summary
      console.log('[inject-django] Entry points:');
      for (const { name, js, css } of perEntry) {
        console.log(`  ${name}: ${js} (${css} CSS)`);
      }

      // Cross-check: CSS files on disk vs CSS reachable via static imports
      const cssDir = path.join(buildOutDir, 'css');
      const cssOnDisk = fs.existsSync(cssDir)
        ? fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).map(f => `css/${f}`)
        : [];
      const cssFromStaticImports = new Set();
      for (const sourceKey of Object.values(ENTRY_TO_SOURCE)) {
        for (const css of collectCss(manifest, sourceKey, new Set())) {
          cssFromStaticImports.add(css);
        }
      }
      const cssFromDynamicImports = cssOnDisk.filter(f => !cssFromStaticImports.has(f));
      console.log(`[inject-django] CSS: ${cssOnDisk.length} on disk, ${cssFromStaticImports.size} static, ${cssFromDynamicImports.length} dynamic`);

      // Result
      if (successCount === Object.keys(ENTRY_TO_TEMPLATE).length) {
        console.log(`✓ Injected assets into all ${successCount} Django templates`);
      } else {
        console.warn(`⚠ Injected assets into ${successCount}/${Object.keys(ENTRY_TO_TEMPLATE).length} Django templates (some failed)`);
      }
    },
  };
}
