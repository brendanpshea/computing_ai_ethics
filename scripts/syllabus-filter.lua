-- Filter for the syllabus HTML build (see scripts/build-syllabus.sh).
--
-- 1. Drops the source document's own H1 and the "PHIL 1150-71 | Fall 2026"
--    line beneath it: the page template already renders both in the header,
--    so leaving them in the body prints the course name twice.
-- 2. Wraps tables in a horizontally scrollable div, so the wide course
--    calendar scrolls inside itself on a phone instead of forcing the
--    whole page sideways.

local seen_h1 = false
local dropped_h1 = false

function Header(el)
  if el.level == 1 and not seen_h1 then
    seen_h1 = true
    dropped_h1 = true
    return {}
  end
  return el
end

function Para(el)
  -- only the term line immediately after the dropped H1
  if dropped_h1 then
    dropped_h1 = false
    local txt = pandoc.utils.stringify(el)
    if txt:match("PHIL%s*1150") then return {} end
  end
  return el
end

function Table(el)
  return pandoc.Div({ el }, pandoc.Attr("", { "table-scroll" }))
end
