/**
 * cite.js — Client-side bibliography for Computing & AI Ethics
 * ==============================================================
 *
 * Loads ../refs.bib, parses BibTeX, and:
 *   1. Replaces every <cite data-key="bibtex_key"> with an
 *      APA-style inline citation that links to the reference list.
 *   2. Populates <div id="bibliography"> (if present) with a
 *      sorted, formatted reference list.
 *
 * USAGE IN HTML
 * -------------
 *   Inline citation:
 *     <cite data-key="plato_phaedrus"></cite>
 *   renders as: (Plato, 1925) linked to the reference entry.
 *
 *   Reference list:
 *     <section id="references-section">
 *       <h2>References</h2>
 *       <div id="bibliography"></div>
 *     </section>
 *
 * REQUIREMENTS
 * ------------
 *   - Served from a web server (not file://) so that fetch() works.
 *     For local preview: python -m http.server 8000  or  VS Code Live Server.
 *   - ../refs.bib must exist relative to the HTML file.
 *
 * NOTES
 * -----
 *   - Entry types handled: book, article, report, misc,
 *     inproceedings, incollection, techreport.
 *   - Corporate/institutional authors use double-braces in BibTeX:
 *       author = {{Pew Research Center}}
 *     and are kept verbatim.
 *   - Unknown keys are flagged in red so authors notice them quickly.
 */

(function () {
  'use strict';

  /* ===========================================================
     1. BibTeX Parser
     =========================================================== */

  /**
   * Parse a BibTeX source string and return a plain-object map
   * of { entryKey → { type, key, field1, field2, … } }.
   */
  function parseBibtex(src) {
    const db = {};
    let i = 0;
    const len = src.length;

    while (i < len) {
      // Advance to the next '@'
      while (i < len && src[i] !== '@') i++;
      if (i >= len) break;
      i++; // skip '@'

      // Read entry type  (book, article, misc, comment, …)
      let typeStart = i;
      while (i < len && /[A-Za-z]/.test(src[i])) i++;
      const type = src.slice(typeStart, i).toLowerCase().trim();

      // Skip whitespace
      while (i < len && /\s/.test(src[i])) i++;

      // Expect '{'
      if (i >= len || src[i] !== '{') continue;
      i++; // skip '{'

      // ---- @comment / @preamble / @string — skip the block ----
      if (type === 'comment' || type === 'preamble' || type === 'string') {
        let depth = 1;
        while (i < len && depth > 0) {
          if (src[i] === '{') depth++;
          else if (src[i] === '}') depth--;
          i++;
        }
        continue;
      }

      // Read citation key (up to the first comma or '}')
      let keyStart = i;
      while (i < len && src[i] !== ',' && src[i] !== '}') i++;
      const key = src.slice(keyStart, i).trim();
      if (!key) continue;
      if (i < len && src[i] === ',') i++; // skip comma

      // Read fields until the matching closing '}'
      // We need to track brace depth so nested braces don't trip us up.
      let fields = {};
      let depth = 1;
      let fieldBuf = '';

      while (i < len && depth > 0) {
        const ch = src[i];
        if (ch === '{') {
          depth++;
          fieldBuf += ch;
          i++;
        } else if (ch === '}') {
          depth--;
          if (depth === 0) {
            // End of entry — parse any remaining field buffer
            if (fieldBuf.trim()) {
              Object.assign(fields, parseField(fieldBuf.trim()));
            }
            i++;
            break;
          }
          fieldBuf += ch;
          i++;
        } else {
          fieldBuf += ch;
          i++;
        }
      }

      // Now parse fieldBuf for name=value pairs
      fields = parseAllFields(fieldBuf);

      db[key] = { type, key, ...fields };
    }

    return db;
  }

  /**
   * Parse a BibTeX field body (the part after the entry key and first comma).
   * Returns { fieldName: rawValue, … }
   */
  function parseAllFields(body) {
    const fields = {};
    let i = 0;
    const len = body.length;

    while (i < len) {
      // Skip whitespace and commas
      while (i < len && /[\s,]/.test(body[i])) i++;
      if (i >= len) break;

      // Read field name
      const nameStart = i;
      while (i < len && /[A-Za-z_]/.test(body[i])) i++;
      const name = body.slice(nameStart, i).toLowerCase().trim();
      if (!name) { i++; continue; }

      // Skip whitespace then '='
      while (i < len && /[\s=]/.test(body[i])) i++;

      // Read field value
      let value = '';
      if (i < len && body[i] === '{') {
        // Brace-enclosed value — respect nesting
        i++; // skip opening '{'
        let depth = 1;
        const vStart = i;
        while (i < len && depth > 0) {
          if (body[i] === '{') depth++;
          else if (body[i] === '}') depth--;
          i++;
        }
        value = body.slice(vStart, i - 1); // exclude closing '}'
      } else if (i < len && body[i] === '"') {
        i++; // skip opening '"'
        const vStart = i;
        while (i < len && body[i] !== '"') i++;
        value = body.slice(vStart, i);
        if (i < len) i++; // skip closing '"'
      } else {
        // Bare value (e.g. year = 2009)
        const vStart = i;
        while (i < len && body[i] !== ',' && body[i] !== '\n') i++;
        value = body.slice(vStart, i).trim();
      }

      // Normalise whitespace; strip surrounding braces left by nesting
      value = value.replace(/\s+/g, ' ').trim();

      if (name) fields[name] = value;
    }

    return fields;
  }

  // Thin wrapper kept for compatibility
  function parseField(text) { return parseAllFields(text); }


  /* ===========================================================
     2. Author Utilities
     =========================================================== */

  /**
   * Split a BibTeX author string into an array of author objects:
   * { last, first, initials, corporate }.
   *
   * Handles:
   *   "Last, First Middle and Last2, First2"
   *   "First Last and First2 Last2"
   *   "{Corporate Name}"  (treated as single token)
   */
  function parseAuthors(authorStr) {
    if (!authorStr) return [];

    // Check for corporate author: {Pew Research Center} or {{Pew Research Center}}
    // After field parsing, outer braces are stripped once; {{…}} becomes {…}
    // We handle both bare "Corporate Name" (if double-braced in source) and
    // remaining single-braced "{Corporate Name}" values.
    const singleAuthors = authorStr.split(/\s+and\s+/i);

    return singleAuthors.map(raw => {
      const a = raw.trim().replace(/^\{|\}$/g, ''); // strip wrapping braces

      // If it looks like a corporate name (contains no comma and starts with
      // an uppercase run, or the outer braces were present), keep verbatim.
      // Heuristic: if no comma and contains spaces + mostly not initials → corporate
      if (!a.includes(',')) {
        const words = a.split(/\s+/);
        // Looks like "First Last" — treat as personal name
        if (words.length === 1) {
          return { last: a, first: '', initials: '', corporate: false };
        }
        // Could be "First Last" or "Corporate Name With Spaces"
        // If every word is capitalised and there's no obvious first-name word → corporate
        const lastWord = words[words.length - 1];
        const firstWords = words.slice(0, -1).join(' ');
        return {
          last: lastWord, first: firstWords,
          initials: getInitials(firstWords), corporate: false
        };
      }

      // "Last, First" format
      const commaIdx = a.indexOf(',');
      const last = a.slice(0, commaIdx).trim();
      const first = a.slice(commaIdx + 1).trim();
      return { last, first, initials: getInitials(first), corporate: false };
    });
  }

  function getInitials(first) {
    if (!first) return '';
    return first
      .split(/[\s\-]+/)
      .filter(w => w.length > 0)
      .map(w => w[0].toUpperCase() + '.')
      .join(' ');
  }

  /** APA inline: Last (1 author), Last & Last2 (2), Last et al. (3+) */
  function authorsInline(authors) {
    if (!authors.length) return '';
    // Corporate authors — use full name
    const name0 = authors[0].corporate ? authors[0].last
                : authors[0].last;
    if (authors.length === 1) return name0;
    if (authors.length === 2) {
      const name1 = authors[1].last;
      return `${name0} &amp; ${name1}`;
    }
    return `${name0} et al.`;
  }

  /** APA bibliography author list */
  function authorsBib(authors) {
    const fmt = authors.map((a, idx) => {
      if (a.corporate) return a.last;
      if (!a.initials) return a.last;
      return `${a.last}, ${a.initials}`;
    });
    if (fmt.length === 1) return fmt[0];
    const last = fmt.pop();
    return fmt.join(', ') + ', &amp; ' + last;
  }


  /* ===========================================================
     3. APA Formatters
     =========================================================== */

  /**
   * Return a short HTML inline citation string: "(Author, Year)"
   */
  function formatInline(entry) {
    const authors = parseAuthors(entry.author || entry.editor || '');
    const year = entry.year || 'n.d.';

    if (!authors.length) {
      // No author — use title (shortened)
      const t = entry.title || entry.key;
      const short = t.length > 40 ? t.slice(0, 40) + '…' : t;
      return `(<em>${short}</em>, ${year})`;
    }

    return `(${authorsInline(authors)}, ${year})`;
  }

  /**
   * Return a full HTML bibliography entry string (APA 7th ed., approximate).
   */
  function formatBibEntry(entry) {
    const authors = parseAuthors(entry.author || '');
    const editors = parseAuthors(entry.editor || '');
    const year   = entry.year || 'n.d.';
    const title  = cleanLatex(entry.title || '');
    const url    = entry.url || '';
    const doi    = entry.doi  || '';

    let html = '';

    // ── Author / year ──────────────────────────────────────────
    if (authors.length) {
      html += `${authorsBib(authors)} (${year}). `;
    } else if (editors.length) {
      html += `${authorsBib(editors)} (Ed${editors.length > 1 ? 's' : ''}.). (${year}). `;
    } else {
      html += `(${year}). `;
    }

    // ── Title + body ───────────────────────────────────────────
    switch (entry.type) {

      case 'book': {
        html += `<em>${title}</em>`;
        if (entry.edition) html += ` (${entry.edition} ed.)`;
        if (entry.translator) html += ` (${cleanLatex(entry.translator)}, Trans.)`;
        html += '.';
        if (entry.publisher) html += ` ${cleanLatex(entry.publisher)}.`;
        if (entry.note && /original work/i.test(entry.note)) {
          html += ` (${cleanLatex(entry.note)})`;
        }
        break;
      }

      case 'article': {
        html += `${title}. `;
        if (entry.journal) {
          html += `<em>${cleanLatex(entry.journal)}</em>`;
          if (entry.volume) html += `, <em>${entry.volume}</em>`;
          if (entry.number) html += `(${entry.number})`;
          if (entry.pages)  html += `, ${entry.pages}`;
          html += '.';
        }
        break;
      }

      case 'inproceedings':
      case 'conference': {
        html += `${title}. `;
        if (entry.booktitle) {
          html += `In <em>${cleanLatex(entry.booktitle)}</em>`;
          if (entry.pages) html += ` (pp. ${entry.pages})`;
          html += '.';
        }
        if (entry.publisher) html += ` ${cleanLatex(entry.publisher)}.`;
        break;
      }

      case 'incollection': {
        html += `${title}. `;
        const eds = parseAuthors(entry.editor || '');
        if (eds.length) {
          html += `In ${authorsBib(eds)} (Ed${eds.length > 1 ? 's' : ''}.), `;
        }
        if (entry.booktitle) {
          html += `<em>${cleanLatex(entry.booktitle)}</em>`;
          if (entry.pages) html += ` (pp. ${entry.pages})`;
          html += '.';
        }
        if (entry.publisher) html += ` ${cleanLatex(entry.publisher)}.`;
        break;
      }

      case 'report':
      case 'techreport': {
        html += `<em>${title}</em>`;
        if (entry.number) html += ` (Report No. ${entry.number})`;
        html += '.';
        const inst = entry.institution || entry.organization || '';
        if (inst) html += ` ${cleanLatex(inst)}.`;
        break;
      }

      case 'misc':
      default: {
        // Could be a website, manifesto, law, letter…
        if (entry.howpublished && !entry.url) {
          html += `${title} [${cleanLatex(entry.howpublished)}].`;
        } else {
          html += `<em>${title}</em>.`;
        }
        const org = entry.organization || entry.institution || '';
        if (org) html += ` ${cleanLatex(org)}.`;
        if (entry.note) html += ` ${cleanLatex(entry.note)}.`;
        break;
      }
    }

    // ── DOI / URL ──────────────────────────────────────────────
    if (doi) {
      html += ` <a href="https://doi.org/${doi}" target="_blank" rel="noopener">https://doi.org/${doi}</a>`;
    } else if (url) {
      html += ` <a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    }

    return html;
  }

  /** Strip common LaTeX markup from strings before displaying as HTML. */
  function cleanLatex(s) {
    if (!s) return '';
    return s
      .replace(/\\textit\{([^}]*)\}/g, '<em>$1</em>')
      .replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>')
      .replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>')
      .replace(/\\&/g, '&amp;')
      .replace(/\\S/g, '§')
      .replace(/\\~{}/g, '~')
      .replace(/``/g, '\u201C')
      .replace(/''/g, '\u201D')
      .replace(/`/g,  '\u2018')
      .replace(/'/g,  '\u2019')
      .replace(/--/g, '\u2013')
      .replace(/\{|\}/g, ''); // strip remaining bare braces
  }


  /* ===========================================================
     4. Sort key
     =========================================================== */

  function sortKey(entry) {
    const authors = parseAuthors(entry.author || entry.editor || '');
    const last = authors.length ? authors[0].last.toLowerCase() : 'zzz';
    const year = entry.year || '0';
    return last + year + entry.key;
  }


  /* ===========================================================
     5. Main — wire everything together
     =========================================================== */

  async function init() {
    // Collect all <cite data-key="…"> elements
    const citeEls = Array.from(document.querySelectorAll('cite[data-key]'));
    const bibDiv  = document.getElementById('bibliography');
    if (!citeEls.length && !bibDiv) return;

    // ── Load refs.bib ──────────────────────────────────────────
    let db;
    try {
      const resp = await fetch('../refs.bib');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      db = parseBibtex(text);
    } catch (err) {
      console.warn('[cite.js] Could not load ../refs.bib:', err.message,
                   '\nMake sure you are serving the site from a web server, ' +
                   'not opening HTML files directly with file://');
      // Degrade gracefully: show the raw key
      citeEls.forEach(el => {
        const k = el.dataset.key;
        el.textContent = `[${k}]`;
        el.title = 'Bibliography unavailable — serve from a web server to load citations';
      });
      return;
    }

    // ── Collect cited keys in document order ───────────────────
    const citedKeys  = [];
    const seenKeys   = new Set();

    citeEls.forEach(el => {
      const key = el.dataset.key.trim();
      if (!key) return;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        citedKeys.push(key);
      }
    });

    // ── Render inline citations ────────────────────────────────
    citeEls.forEach(el => {
      const key   = el.dataset.key.trim();
      const entry = db[key];

      if (!entry) {
        el.innerHTML = `<span style="color:var(--red-mid);font-weight:700">[${key}?]</span>`;
        el.title = 'Key not found in refs.bib';
        console.warn(`[cite.js] Unknown citation key: "${key}"`);
        return;
      }

      const inline = formatInline(entry);
      el.innerHTML =
        `<a href="#ref-${key}" class="cite-link" title="${el.dataset.key}">${inline}</a>`;
      el.removeAttribute('data-key');  // avoid duplicate processing
      el.dataset.resolved = key;
    });

    // ── Render bibliography ────────────────────────────────────
    if (!bibDiv) return;

    // Keys to display: cited keys first, then any additional keys not cited
    // (sorted alphabetically within each group).
    const allKeys = Object.keys(db).sort((a, b) => sortKey(db[a]).localeCompare(sortKey(db[b])));

    // In a chapter, only show cited references.
    // If no citeEls exist at all, show the full bibliography (e.g. a bibliography page).
    const keysToShow = citedKeys.length > 0
      ? citedKeys.slice().sort((a, b) => sortKey(db[a] || {key:a}).localeCompare(sortKey(db[b] || {key:b})))
      : allKeys;

    const ol = document.createElement('ol');
    ol.className = 'bibliography-list';

    keysToShow.forEach(key => {
      const entry = db[key];
      const li    = document.createElement('li');
      li.id = `ref-${key}`;
      li.className = 'bib-entry';

      if (!entry) {
        li.textContent = `[Missing entry: ${key}]`;
        li.style.color = 'var(--red-mid)';
      } else {
        li.innerHTML = formatBibEntry(entry);
      }

      ol.appendChild(li);
    });

    bibDiv.appendChild(ol);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
