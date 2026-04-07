#!/usr/bin/env node
/**
 * build-docx.js
 * Converts HTML chapters to .docx via:
 *   1. Pre-render Mermaid diagrams → PNG  (mmdc)
 *   2. Convert <cite data-key="…"> → Pandoc citation spans
 *   3. Strip navigation / TOC / scripts
 *   4. Pandoc HTML → docx with Lua style filter + --citeproc
 *
 * Usage:
 *   node scripts/build-docx.js            # all chapters
 *   node scripts/build-docx.js ch03       # single chapter (prefix match)
 */

'use strict';

const fs        = require('fs');
const path      = require('path');
const os        = require('os');
const { spawnSync } = require('child_process');
const cheerio   = require('cheerio');

// ── Paths ────────────────────────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..');
const HTML_DIR   = path.join(ROOT, 'html');
const IMAGES_DIR = path.join(ROOT, 'images');
const OUTPUT_DIR = path.join(ROOT, 'docx');
const FILTER     = path.join(__dirname, 'html2docx-filter.lua');
const REF_DOC    = path.join(ROOT, 'reference.docx');
const REFS_BIB   = path.join(ROOT, 'refs.bib');
const MMD_CFG    = path.join(__dirname, 'mermaid-config.json');
const CSL_FILE   = path.join(ROOT, 'apa.csl');

// mmdc binary (local install)
const MMDC = path.join(ROOT, 'node_modules', '.bin',
  process.platform === 'win32' ? 'mmdc.cmd' : 'mmdc');

// ── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd, args, opts = {}) {
  // On Windows, .cmd files must be invoked via cmd.exe to avoid shell:true
  let finalCmd = cmd;
  let finalArgs = args;
  if (process.platform === 'win32' && cmd.endsWith('.cmd')) {
    finalArgs = ['/c', cmd, ...args];
    finalCmd = 'cmd';
  }
  const result = spawnSync(finalCmd, finalArgs, {
    encoding: 'utf8',
    shell: false,
    timeout: 60_000,
    ...opts,
  });
  if (result.error) throw result.error;
  return result;
}

/** Replace backslashes with forward slashes (for HTML src attributes on Windows). */
function posixPath(p) {
  return p.replace(/\\/g, '/');
}

// ── Step 1: Mermaid → PNG ────────────────────────────────────────────────────

function renderMermaid($, chapterSlug, tempDir) {
  const diagrams = $('div.mermaid');
  if (diagrams.length === 0) return;

  const diagDir = path.join(tempDir, `${chapterSlug}-diagrams`);
  fs.mkdirSync(diagDir, { recursive: true });

  diagrams.each((i, el) => {
    const source  = $(el).text().trim();
    const mmdFile = path.join(diagDir, `diag_${i}.mmd`);
    const pngFile = path.join(diagDir, `diag_${i}.png`);

    fs.writeFileSync(mmdFile, source, 'utf8');

    const result = run(MMDC, [
      '-i', mmdFile,
      '-o', pngFile,
      '-c', MMD_CFG,
      '-b', 'white',
      '--width', '900',
    ]);

    if (result.status !== 0) {
      console.warn(`  ⚠  Diagram ${i + 1} failed:\n${result.stderr}`);
      // Leave the mermaid div in place — Pandoc will skip it gracefully
      return;
    }

    // Replace the div (keep the wrapping <figure> intact)
    $(el).replaceWith(
      `<img src="${posixPath(pngFile)}" alt="Diagram ${i + 1}" style="max-width:100%">`
    );
    console.log(`  ✓ Diagram ${i + 1} → ${path.basename(pngFile)}`);
  });
}

// ── Step 2: Citations ────────────────────────────────────────────────────────

function convertCitations($) {
  // Remove the JS-populated bibliography section; --citeproc will rebuild it.
  $('section#references-section').remove();
  $('div#bibliography').remove();

  // <cite data-key="foo"> → <span class="citation" data-cites="foo">[@foo]</span>
  // The Lua filter converts these Spans to proper Cite AST nodes for --citeproc.
  $('cite[data-key]').each((_, el) => {
    const key  = $(el).attr('data-key');
    const span = `<span class="citation" data-cites="${key}">[@${key}]</span>`;
    $(el).replaceWith(span);
  });
}

// ── Step 2b: Wrap inner styled <p> elements in <div> wrappers ────────────────
// Pandoc's HTML reader preserves classes on <div> but drops them from <p>.
// Wrapping lets the Lua filter map box-label, box-title, term, etc. to styles.

const WRAPPED_P_CLASSES = [
  'box-label', 'box-title',
  'term', 'definition',
  'thinker-label', 'thinker-name', 'thinker-body',
  'conclusion',
  'chapter-eyebrow', 'chapter-subtitle',
];

function wrapStyledParagraphs($) {
  WRAPPED_P_CLASSES.forEach(cls => {
    $(`p.${cls}`).each((_, el) => {
      $(el).wrap(`<div class="${cls}"></div>`);
    });
  });
}

// ── Step 3: Strip navigation / chrome ───────────────────────────────────────

const STRIP_SELECTORS = [
  'nav.top-nav',
  '.toc-box',
  'nav[aria-label="Table of contents"]',
  'footer.chapter-footer',
  'script',
  'link[rel="stylesheet"]',
];

function stripChrome($) {
  STRIP_SELECTORS.forEach(sel => $(sel).remove());
}

// ── Step 4: Fix image paths to absolute ──────────────────────────────────────

function fixImagePaths($) {
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && src.startsWith('../images/')) {
      const abs = path.join(IMAGES_DIR, src.replace('../images/', ''));
      $(el).attr('src', posixPath(abs));
    }
  });
}

// ── Step 5: Pandoc ───────────────────────────────────────────────────────────

function runPandoc(htmlPath, outputPath, chapterTitle, tempDir) {
  // Write metadata to a YAML file to avoid shell-splitting issues with spaces.
  const metaFile = path.join(tempDir, path.basename(htmlPath, '.html') + '-meta.yaml');
  const safeTitle = chapterTitle.replace(/'/g, "''");
  fs.writeFileSync(metaFile,
    `---\ntitle: '${safeTitle}'\nreference-section-title: 'References'\n---\n`,
    'utf8'
  );

  const args = [
    htmlPath,
    '-o',                outputPath,
    '--from',            'html',
    '--to',              'docx',
    '--reference-doc',   REF_DOC,
    '--lua-filter',      FILTER,
    '--citeproc',
    '--bibliography',    REFS_BIB,
    '--metadata-file',   metaFile,
    '--resource-path',   `${HTML_DIR}${path.delimiter}${IMAGES_DIR}`,
  ];

  if (fs.existsSync(CSL_FILE)) {
    args.push('--csl', CSL_FILE);
  }

  const result = run('pandoc', args);
  if (result.status !== 0) {
    console.error(`  ✗ Pandoc error:\n${result.stderr}`);
    return false;
  }
  return true;
}

// ── Main: process one chapter ────────────────────────────────────────────────

function processChapter(filename, tempDir) {
  const slug      = path.basename(filename, '.html');
  const htmlPath  = path.join(HTML_DIR, filename);
  const outPath   = path.join(OUTPUT_DIR, `${slug}.docx`);

  console.log(`\n── ${filename}`);

  const html = fs.readFileSync(htmlPath, 'utf8');
  const $    = cheerio.load(html);

  // Extract chapter title for docx metadata
  const title = $('h1').first().text().trim()
    || $('title').text().trim()
    || slug;

  stripChrome($);
  renderMermaid($, slug, tempDir);
  convertCitations($);
  wrapStyledParagraphs($);
  fixImagePaths($);

  const tempHtml = path.join(tempDir, `${slug}.html`);
  fs.writeFileSync(tempHtml, $.html(), 'utf8');

  const ok = runPandoc(tempHtml, outPath, title, tempDir);
  if (ok) console.log(`  → ${outPath}`);
}

// ── Entry point ───────────────────────────────────────────────────────────────

function main() {
  // Validate prerequisites
  if (!fs.existsSync(REF_DOC)) {
    console.error('reference.docx not found. Run: python scripts/make-reference-docx.py');
    process.exit(1);
  }
  if (!fs.existsSync(MMDC)) {
    console.error(`mmdc not found at ${MMDC}. Run: npm install`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Determine which chapters to build
  const filter = process.argv[2] || '';
  const allChapters = fs.readdirSync(HTML_DIR)
    .filter(f => /^ch\d{2}_.*\.html$/.test(f))
    .sort();

  const targets = filter
    ? allChapters.filter(f => f.startsWith(filter))
    : allChapters;

  if (targets.length === 0) {
    console.error(`No chapters matched: "${filter}"`);
    process.exit(1);
  }

  console.log(`Building ${targets.length} chapter(s) → ${OUTPUT_DIR}`);

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docx-build-'));
  try {
    for (const chapter of targets) {
      processChapter(chapter, tempDir);
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log('\nDone.');
}

main();
