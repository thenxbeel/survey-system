// scripts/i18n_extractor.js
// Node script to automatically extract hard‑coded UI strings from the codebase,
// generate translation keys, add them to lib/i18n/en.ts and lib/i18n/ar.ts,
// and replace the literals with the t('key') translation hook.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const I18N_DIR = path.join(ROOT, 'lib', 'i18n');
const EN_FILE = path.join(I18N_DIR, 'en.ts');
const AR_FILE = path.join(I18N_DIR, 'ar.ts');

// Load existing translation objects (as simple JS objects).
function loadTranslations(file) {
  const content = fs.readFileSync(file, 'utf8');
  // The file exports default object like: export const en = { ... };
  const match = content.match(/export const (?:en|ar)\s*=\s*{([\s\S]*?)};/);
  if (!match) return {};
  const objText = `{${match[1]}}`;
  // Use eval in a safe manner – we replace backticks with quotes.
  const safeText = objText.replace(/`/g, "\\`");
  // eslint-disable-next-line no-eval
  return eval('(' + safeText + ')');
}

function saveTranslations(file, obj, exportName) {
  const entries = Object.entries(obj)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `  '${k}': '${v.replace(/'/g, "\\'")}',`)
    .join('\n');
  const content = `export const ${exportName} = {\n${entries}\n};\n`;
  fs.writeFileSync(file, content, 'utf8');
}

const enTranslations = loadTranslations(EN_FILE);
const arTranslations = loadTranslations(AR_FILE);

// Helper to create a unique key from file path and original string.
function makeKey(filePath, str) {
  const base = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const clean = str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const key = `${base.replace(/\//g, '_')}_${clean}`;
  return key;
}

// Recursively walk the project and process .tsx/.ts/.jsx/.js files.
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip common non‑source dirs
      if (['node_modules', '.next', '.git', 'out', 'dist', 'build'].includes(entry.name)) continue;
      walk(fullPath);
    } else if (entry.isFile()) {
      if (!/\.(tsx|ts|jsx|js)$/.test(entry.name)) continue;
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  const hasImport = /useTranslation/.test(content);

  // Regexes for JSX text nodes and attribute values.
  const jsxTextRegex = />{t('scripts_i18n_extractor.js_s')}<>{t('scripts_i18n_extractor.js_s')}</g;
  const attrRegex = /(\w+)=\s*"([^"]+?)"/g;
  const attrSingleRegex = /(\w+)=\s*'([^']+?)'/g;

  const skipAttrs = ['className', 'style', 'id', 'key', 'href', 'src', 'type', 'value', 'checked', 'name'];

  // JSX text nodes
  content = content.replace(jsxTextRegex, (match, p1) => {
    const trimmed = p1.trim();
    if (!trimmed) return match;
    // ignore plain identifiers or numbers
    if (/^[\w-]+$/.test(trimmed) && !/[A-Z]/.test(trimmed)) return match;
    const key = makeKey(filePath, trimmed);
    if (!enTranslations[key]) enTranslations[key] = trimmed;
    if (!arTranslations[key]) arTranslations[key] = trimmed; // placeholder Arabic same as English
    return `>{t('scripts_i18n_extractor.js_t_key')}<`;
  });

  // Double‑quoted attributes
  content = content.replace(attrRegex, (match, attrName, attrVal) => {
    if (skipAttrs.includes(attrName)) return match;
    const trimmed = attrVal.trim();
    if (!trimmed) return match;
    const key = makeKey(filePath, trimmed);
    if (!enTranslations[key]) enTranslations[key] = trimmed;
    if (!arTranslations[key]) arTranslations[key] = trimmed;
    return `${attrName}={t('${key}')}`;
  });

  // Single‑quoted attributes
  content = content.replace(attrSingleRegex, (match, attrName, attrVal) =>{t('scripts_i18n_extractor.js_if_skipattrs_includes_attrname_return_match_const_trimmed_attrval_trim_if_trimmed_return_match_const_key_makekey_filepath_trimmed_if_entranslations_key_entranslations_key_trimmed_if_artranslations_key_artranslations_key_trimmed_return_attrname_t_key_ensure_import_of_usetranslation_if_we_changed_the_file_if_content_original_hasimport_const_lines_content_split_n_let_insertidx_0_for_let_i_0_i')}< lines.length; i++) {
      if (/^['"]use client['"]/.test(lines[i])) { insertIdx = i + 1; break; }
      if (/^import/.test(lines[i])) { insertIdx = i + 1; }
    }
    lines.splice(insertIdx, 0, "import { useTranslation } from '@/lib/i18n/useTranslation';");
    content = lines.join('\n');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walk(ROOT);

saveTranslations(EN_FILE, enTranslations, 'en');
saveTranslations(AR_FILE, arTranslations, 'ar');

console.log('i18n extraction & code transformation complete.');
