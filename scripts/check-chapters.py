#!/usr/bin/env python3
"""Check the HTML chapters against docs/CHAPTER_GUIDELINES.md.

Catches the mechanical problems a human proofreader shouldn't have to hunt for:
citation keys that don't resolve against refs.bib, missing alt text, tables
without captions or header scopes, table-of-contents links pointing at ids that
don't exist, broken chapter-to-chapter navigation, heading-level skips,
unbalanced tags, duplicate ids, and the per-chapter element minimums.

    python3 scripts/check-chapters.py            # check all chapters
    python3 scripts/check-chapters.py ch03       # check one (prefix match)

Exits non-zero if anything fails, so it can gate a deploy.

It does NOT check prose, facts, or whether a quotation is real — see the
warning in CHAPTER_GUIDELINES.md §5.7 about verifying quotations by hand.
"""
import glob
import io
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, "html")

# Per-chapter minimums from CHAPTER_GUIDELINES.md §3.
MINIMUMS = {
    "key-thinker": (2, "Key Thinker cards"),
    "argument-box": (3, "Argument boxes"),
    "case-study": (3, "Case Studies"),
}

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
        "meta", "param", "source", "track", "wbr"}
# Tags HTML lets you leave implicitly closed; don't report those as nesting errors.
LOOSE = {"p", "li", "dt", "dd", "option", "thead", "tbody", "tr", "td", "th"}


def bib_keys():
    src = io.open(os.path.join(ROOT, "refs.bib"), encoding="utf-8").read()
    return set(re.findall(r"@\w+\{\s*([^,\s]+)\s*,", src))


class Doc(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = {}
        self.headings = []
        self.imgs = []
        self.figures = self.figcaptions = 0
        self.tables = self.captions = 0
        self.th_total = self.th_scoped = 0
        self.links = []
        self.citekeys = []
        self.lang = None
        self.stack = []
        self.nesting = []
        self._h = None
        self._buf = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids[a["id"]] = self.ids.get(a["id"], 0) + 1
        if tag == "html":
            self.lang = a.get("lang")
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._h = int(tag[1])
            self._buf = []
        if tag == "img":
            self.imgs.append((a.get("src", ""), a.get("alt")))
        if tag == "figure":
            self.figures += 1
        if tag == "figcaption":
            self.figcaptions += 1
        if tag == "table":
            self.tables += 1
        if tag == "caption":
            self.captions += 1
        if tag == "th":
            self.th_total += 1
            if a.get("scope"):
                self.th_scoped += 1
        if tag == "a" and "href" in a:
            self.links.append(a["href"])
        if tag == "cite" and "data-key" in a:
            self.citekeys.append(a["data-key"])
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))

    def handle_data(self, data):
        if self._h:
            self._buf.append(data)

    def handle_endtag(self, tag):
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6") and self._h:
            self.headings.append((self._h, "".join(self._buf).strip()[:60]))
            self._h = None
        if tag in VOID:
            return
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                unclosed = [t for t, _ in self.stack[i + 1:] if t not in LOOSE]
                if unclosed:
                    self.nesting.append(
                        f"line {self.getpos()[0]}: </{tag}> closes over unclosed {unclosed}")
                del self.stack[i:]
                return
        self.nesting.append(f"line {self.getpos()[0]}: stray </{tag}>")


def check(path, keys):
    src = io.open(path, encoding="utf-8").read()
    d = Doc()
    d.feed(src)
    out = []

    for k in sorted({k for k in d.citekeys if k not in keys}):
        out.append(("CITE", f"data-key not in refs.bib: {k}"))

    for s, alt in d.imgs:
        if not (alt or "").strip():
            out.append(("A11Y", f"img missing alt text: {s}"))
        if s.startswith("images/") or s.startswith("/"):
            out.append(("PATH", f"image path should start ../images/: {s}"))
    if d.figcaptions < d.figures:
        out.append(("A11Y", f"{d.figures - d.figcaptions} figure(s) without <figcaption>"))
    if d.captions < d.tables:
        out.append(("A11Y", f"{d.tables - d.captions} table(s) without <caption>"))
    if d.th_scoped < d.th_total:
        out.append(("A11Y", f"{d.th_total - d.th_scoped} <th> without scope"))
    if d.lang != "en":
        out.append(("A11Y", f'<html lang> is {d.lang!r}, expected "en"'))

    for h in d.links:
        if h.startswith("#") and len(h) > 1 and h[1:] not in d.ids:
            out.append(("LINK", f"anchor target does not exist: {h}"))
        if h.endswith(".html") and not h.startswith("http"):
            if not os.path.exists(os.path.normpath(os.path.join(os.path.dirname(path), h))):
                out.append(("LINK", f"link target does not exist: {h}"))

    prev = 0
    for lvl, txt in d.headings:
        if prev and lvl > prev + 1:
            out.append(("HEAD", f"h{prev} -> h{lvl} skip at {txt!r}"))
        prev = lvl

    for cls, (minimum, label) in MINIMUMS.items():
        n = len(re.findall(r'class="[^"]*\b' + re.escape(cls) + r'\b', src))
        if n < minimum:
            out.append(("MIN", f"{label}: {n} (guidelines require >= {minimum})"))

    tq = len(re.findall(r'class="thought-questions"', src))
    content_h2 = sum(1 for lvl, _ in d.headings if lvl == 2) - 3  # CQ, Key Points, References
    if tq < content_h2:
        out.append(("MIN", f"thought-questions boxes: {tq} for ~{content_h2} content sections"))

    if 'id="bibliography"' not in src:
        out.append(("STRUCT", 'missing <div id="bibliography">'))
    if "cite.js" not in src:
        out.append(("STRUCT", "cite.js not loaded"))
    for e in d.nesting:
        out.append(("STRUCT", e))
    left = [(t, l) for t, l in d.stack if t not in LOOSE]
    if left:
        out.append(("STRUCT", f"tags never closed: {left}"))
    for k, v in d.ids.items():
        if v > 1:
            out.append(("STRUCT", f"duplicate id used {v} times: {k}"))
    for pat, msg in [(r"</p>\s*</p>", "doubled </p>"),
                     (r"<p>\s*<ul", "<ul> nested inside <p>"),
                     (r"<th[a-z]+ ", "mangled th-family tag"),
                     (r"&amp;(lt|gt|amp);", "double-escaped entity")]:
        n = len(re.findall(pat, src))
        if n:
            out.append(("STRUCT", f"{msg}: {n} occurrence(s)"))
    return out


def main():
    keys = bib_keys()
    files = sorted(glob.glob(os.path.join(HTML, "ch[0-9][0-9]_*.html")))
    if len(sys.argv) > 1:
        files = [f for f in files if os.path.basename(f).startswith(sys.argv[1])]
        if not files:
            print(f"No chapter matching {sys.argv[1]!r}")
            return 2
    total = 0
    for f in files:
        issues = check(f, keys)
        name = os.path.basename(f)
        if issues:
            print(f"\n{name} — {len(issues)} issue(s)")
            for kind, msg in issues:
                print(f"  [{kind}] {msg}")
        else:
            print(f"ok  {name}")
        total += len(issues)
    print(f"\n{total} issue(s) across {len(files)} chapter(s)")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
