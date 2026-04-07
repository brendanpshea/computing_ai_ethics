--[[
  html2docx-filter.lua
  Pandoc Lua filter: maps HTML CSS classes → Word custom-style attributes.

  Applied during HTML → docx conversion.  Each named style must exist in
  reference.docx (created by make-reference-docx.py).

  Div elements
  ─────────────
  Pandoc's HTML reader wraps <div class="foo"> and <p class="foo"> in
  Div AST nodes carrying those classes.  Setting the "custom-style"
  attribute on a Div causes every paragraph inside it to receive that
  named Word paragraph style.

  Strip list
  ──────────
  Any Div whose sole purpose is navigation/layout chrome is dropped here
  as a safety net (cheerio already strips most of these, but residual
  wrappers can survive).
]]

local STRIP_CLASSES = {
  ["page-wrapper"]         = true,
  ["content-area"]         = true,
  ["chapter-content"]      = true,
  ["chapter-nav"]          = true,
  ["chapter-footer"]       = true,
  ["chapter-footer-nav"]   = true,
  ["chapter-footer-meta"]  = true,
  ["top-nav"]              = true,
  ["nav-home"]             = true,
  ["nav-next"]             = true,
  ["nav-chapter"]          = true,
  ["footer-nav-btn"]       = true,
  ["table-wrapper"]        = true,   -- unwrap; let the table render normally
}

-- Maps a CSS class to a Word paragraph style name.
-- When a Div has multiple classes, the first match wins.
local STYLE_MAP = {
  -- ── Box types ──────────────────────────────────────────────────────
  ["definition-box"]    = "Definition Box",
  ["argument-box"]      = "Argument Box",
  ["key-thinker"]       = "Key Thinker",
  ["case-study"]        = "Case Study",
  ["pro-argument"]      = "Pro Argument",
  ["objection"]         = "Objection",
  ["thought-questions"] = "Thought Questions",
  ["key-points"]        = "Key Points",
  ["central-questions"] = "Central Questions",

  -- ── Within-box labels & titles ─────────────────────────────────────
  ["box-label"]         = "Box Label",
  ["box-title"]         = "Box Title",
  ["term"]              = "Definition Term",
  ["definition"]        = "Definition Body",
  ["thinker-label"]     = "Box Label",
  ["thinker-name"]      = "Box Title",
  ["thinker-body"]      = "Key Thinker",

  -- ── Argument internals ─────────────────────────────────────────────
  ["premises"]          = "Argument Box",
  ["conclusion"]        = "Argument Conclusion",

  -- ── Chapter header ─────────────────────────────────────────────────
  ["chapter-eyebrow"]   = "Chapter Eyebrow",
  ["chapter-subtitle"]  = "Chapter Subtitle",
}

-- Returns the first matching style for a set of classes, or nil.
local function find_style(classes)
  for _, cls in ipairs(classes) do
    if STYLE_MAP[cls] then
      return STYLE_MAP[cls]
    end
  end
  return nil
end

-- Returns true if any class is in the strip list.
local function should_strip(classes)
  for _, cls in ipairs(classes) do
    if STRIP_CLASSES[cls] then return true end
  end
  return false
end

-- ── Div handler ──────────────────────────────────────────────────────────────

function Div(el)
  -- Strip layout-only wrappers: unwrap their content into the parent.
  if should_strip(el.classes) then
    return el.content   -- returning a list unwraps the div
  end

  local style = find_style(el.classes)
  if style then
    el.attributes["custom-style"] = style
    return el
  end
end

-- ── Span handler: convert citation spans to Cite AST nodes ──────────────────
-- Pandoc's HTML reader creates Span{class=citation, cites=key} but NOT a Cite
-- node.  --citeproc only processes Cite nodes, so we convert here.

function Span(el)
  if el.classes:includes("citation") then
    local keys_str = el.attributes["cites"] or el.attributes["data-cites"] or ""
    if keys_str ~= "" then
      local citations = {}
      for key in keys_str:gmatch("%S+") do
        table.insert(citations, pandoc.Citation(key, pandoc.NormalCitation))
      end
      return pandoc.Cite(el.content, citations)
    end
  end
end

-- ── BlockQuote handler (quote-block is a <blockquote>) ───────────────────────

function BlockQuote(el)
  -- Wrap in a Div with the "Block Quote" custom style.
  local div = pandoc.Div(el.content)
  div.attributes["custom-style"] = "Block Quote"
  return div
end

-- ── Header cleanup ────────────────────────────────────────────────────────────
-- Pandoc may read the chapter <header> element as a sequence of blocks.
-- h1 stays as Heading 1; nothing special needed.  But demote any h1
-- that appears inside a section (Pandoc sometimes promotes section headers).

-- (No-op for now — Pandoc 3.x handles heading levels correctly from HTML.)

-- ── Image: ensure figures render with captions ────────────────────────────────

function Figure(el)
  -- Keep figures as-is; Pandoc renders them with captions in docx.
  return el
end
