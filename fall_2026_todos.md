# Fall 2026 High-Priority Edits — Lecture Sequence (latex/ai_ethics_*.tex)

Review date: 2026-07-02. Covers `latex/lecture_preamble.tex` and the 12 main lecture decks.
Written for both human editors and LLM implementers. Each item gives the file, a search
string or line anchor, and what to change. Line numbers are approximate — **always match
on the quoted search string, not the line number.**

Priorities: **P1** = factual/attribution errors (fix before teaching), **P2** = time-sensitive
content to refresh, **P3** = structural bugs, **P4** = consistency/design, **P5** = pedagogy
improvements (nice to have).

---

## P1 — Scholarly accuracy (fix before next term)

### 1.1 Misattributed Aristotle quote (Lecture 2)
- **File:** `latex/ai_ethics_02_virtues.tex` (~line 38)
- **Find:** `“We are what we repeatedly do. Excellence, then, is not an act, but a habit.”`
- **Problem:** This is **Will Durant's paraphrase** of Aristotle (*The Story of Philosophy*, 1926), not Aristotle. It is currently cited as `\parencite{aristotle_nicomachean}` — a direct misattribution in a course that teaches source evaluation.
- **Fix:** Either replace with a genuine NE quote (e.g., NE II.1, 1103a–b: "we become just by doing just acts…", which is already used correctly at ~line 275), or keep the Durant line but attribute it: "Will Durant, summarizing Aristotle." This is also a nice teachable moment about quote laundering.

### 1.2 "Stochastic parrot" attributed to Dennett (Lecture 11)
- **File:** `latex/ai_ethics_11_robot_rights.tex` (~line 580)
- **Find:** `\textbf{Stochastic parrot}: sophisticated verbal behavior can be produced by systems with no more inner life than a very complex lookup table (\textcite{dennett_consciousness})`
- **Problem:** The term is Bender, Gebru, McMillan-Major & Shmitchell (2021). The Key Concepts frame at the end of the same file attributes it correctly, so the deck contradicts itself. (Dennett is relevant to the *lookup table / zimbo* point, but not to this term.)
- **Fix:** Cite `bender_stochastic_parrots_2021` (key already exists — it's used in Lecture 10), or rephrase the bullet to make the Dennett point without the term.

### 1.3 Gutenberg was a goldsmith, not a blacksmith (Lecture 1)
- **File:** `latex/ai_ethics_01_history.tex` (~line 421)
- **Find:** `German blacksmith and inventor`
- **Fix:** "German goldsmith and inventor." Goldsmithing is standard in the scholarship and actually matters (metalworking skill → movable type).

### 1.4 Markdown asterisks leaked into LaTeX (Lecture 1)
- **File:** `latex/ai_ethics_01_history.tex` (~line 932)
- **Find:** `concerned the *why* and *how* of this phenomenon`
- **Problem:** Literal `*why*` and `*how*` will render as asterisks on the slide.
- **Fix:** Change to `\textit{why}` and `\textit{how}`.

### 1.5 "ML's arguments" typo (Lecture 3)
- **File:** `latex/ai_ethics_03.free_speech.tex` (~line 980, in the `\mode<article>` block)
- **Find:** `ML's arguments for protecting speech`
- **Fix:** "Mill's arguments". (Only appears in article mode, but it prints in the reader/handout build.)

### 1.6 China Social Credit System — nuance to match current scholarship (Lecture 6)
- **File:** `latex/ai_ethics_06_privacy.tex` (~lines 608–626, "China---The Surveillance State Model")
- **Problem:** The slide presents a unified national "scoring citizens on trustworthiness" system with rewards/punishments. Scholarship (Jeremy Daum/China Law Translate, MIT Tech Review, MERICS) shows this is largely a Western misconception: the real system is a fragmented mix of corporate pilots (many discontinued), court blacklists (the travel-ban mechanism), and regulatory records — mostly not an algorithmic citizen score. **Your own final project topic #26 asks students to debunk exactly this framing**, so the lecture shouldn't reinforce it.
- **Fix:** Reframe the bullet as "Social Credit System: often described in the West as a unified citizen score; in practice a patchwork of blacklists, pilots, and regulatory records — the surveillance is real, the 'score' mostly isn't." Attach the punishments (travel bans) to the court **judgment-defaulter blacklist** specifically. Keep the camera counts and Great Firewall content, which are accurate.

### 1.7 Luther printing-press quote — flag provenance (Lecture 1)
- **File:** `latex/ai_ethics_01_history.tex` (~line 526)
- **Find:** `The art of book printing is the \textbf{last and greatest gift}`
- **Problem:** This quote circulates widely but its provenance is thin (attributed via a secondary German source; sometimes traced to Table Talk paraphrases). Verify against Clemen or soften to "attributed to Luther."
- **Fix (minimum):** Change attribution line to "attributed to Martin Luther" and keep the Clemen citation. If you can verify it, leave as is.

### 1.8 Trump deplatforming: "permanently ban" + missing reinstatement (Lecture 3)
- **File:** `latex/ai_ethics_03.free_speech.tex` (~line 885)
- **Find:** `Twitter, Facebook, YouTube permanently ban sitting U.S. President`
- **Problem:** Only Twitter's ban was "permanent"; Facebook's was indefinite → 2-year suspension. All three reinstated the account by 2023, which students will know and which changes the case study.
- **Fix:** "…ban sitting U.S. President after Capitol riot (Twitter permanently; Facebook and YouTube indefinitely). All three accounts were reinstated by 2023." Consider adding a discussion beat: does reinstatement vindicate either side?

### 1.9 Unsourced attention statistics table (Lecture 2)
- **File:** `latex/ai_ethics_02_virtues.tex` (~lines 527–540, table under "Premise 2a: The Attention Crisis")
- **Problem:** The 2004→2024 table ("attention span 2.5 min → 47 seconds", "deep reading 60 → 15 min/day", "150+ phone checks") is labeled only "approximate figures from attention research." The 47-second figure is Gloria Mark's screen-switching research (real but often misrepresented as "attention span"); the teen deep-reading row appears to be invented. In a course teaching intellectual virtue, unsourced stats are a liability.
- **Fix:** Cite Gloria Mark explicitly for the task-switching row and reframe it as "average time on a single screen before switching"; delete or source the other rows. Same concern applies to the hand-drawn empathy-decline and depression tikz "graphs" (~lines 725–737 and 898–910): add "illustrative, not to scale" to captions or rebuild from actual Konrath / CDC-YRBS data.

### 1.10 Haidt presented without the counter-evidence (Lecture 2)
- **Files:** `latex/ai_ethics_02_virtues.tex` (Premise 2a mental health, ~line 887)
- **Problem:** *The Anxious Generation* correlation-vs-causation critiques (Odgers' *Nature* review, Przybylski's work) are prominent and well known; presenting Haidt uncontested undercuts the deck's own "examine the evidence for each premise" framing. Lecture 12 models this well (Anderson vs. Ferguson) — Lecture 2 should match.
- **Fix:** Add one objection block: "Critics (Odgers 2024; Orben & Przybylski) argue the correlational evidence is weak and effect sizes small; the causal question is open." One slide or half-slide suffices.

### 1.11 Netherlands loot-box ban was overturned (Lecture 12)
- **File:** `latex/ai_ethics_12_games.tex` (~line 515)
- **Find:** `Belgium and the Netherlands banned loot boxes as gambling (2018).`
- **Problem:** The Dutch ruling (against EA/FIFA) was overturned on appeal in March 2022. Belgium's ban stands.
- **Fix:** "Belgium banned loot boxes as gambling (2018); a similar Dutch ruling was overturned on appeal in 2022."

### 1.12 Verify Do Kwon sentencing detail (Lecture 5)
- **File:** `latex/ai_ethics_05.crypto.tex` (~line 934)
- **Find:** `Sentenced December 2025 to 15 years in prison`
- **Action:** Verify sentence length/date against reporting before reprinting (he pleaded guilty in Aug 2025; confirm the December sentencing outcome). Same slide: confirm the "$2.02B stolen in 2025" Lazarus figure is the final Chainalysis year-end number, not a mid-year estimate.

### 1.13 Per-transaction Bitcoin energy metric is contested (Lecture 5)
- **File:** `latex/ai_ethics_05.crypto.tex` (~line 717)
- **Find:** `Single transaction: $\sim$1,400+ kWh`
- **Problem:** "Energy per transaction" divides total mining energy by transaction count — a methodology critics (and even Digiconomist's rivals at CBECI) call misleading, since mining energy doesn't scale with transactions. The wealth-concentration stat on the next slide ("2% of accounts hold 95%") has a similar flaw (exchange addresses hold many users' coins).
- **Fix:** Keep the aggregate TWh numbers (solid), and either cut the per-transaction line or add "(a contested metric — mining energy does not scale per transaction)." Add "(addresses ≠ people; exchanges hold pooled funds)" to the concentration slide. Both are good critical-thinking asides for this audience.

---

## P2 — Time-sensitive content to refresh before Fall 2026

Do one sweep in August 2026. LLM implementers: verify each with current sources before editing; do not invent numbers.

| File | Item | What to check |
|---|---|---|
| `ai_ethics_04_intellectual_property.tex` | "AI Copyright Wars" slide (~line 846) | Status of NYT v. OpenAI, the S.D.N.Y. consolidated cases, and the Anthropic *Bartz* settlement; "Recent developments (2025)" heading will read stale |
| `ai_ethics_05.crypto.tex` | BTC market cap "$2+ trillion", Satoshi holdings "$100–135B" (~lines 309–314) | Refresh figures |
| `ai_ethics_05.crypto.tex` | CBDC table (~line 1041) | Atlantic Council tracker; e-CNY stats; US status |
| `ai_ethics_06_privacy.tex` | Data broker stats table (2024), Clearview photo count | Refresh |
| `ai_ethics_07_ai.tex` | LLM timeline row "2023--25: GPT-4, Claude, Gemini…" (~line 599) | Extend timeline through 2026 |
| `ai_ethics_09_impact.tex` | FDA AI device count "1,451 as of 2026-03-04" (~line 392); IEA Electricity 2026 | Update to latest list; also reformat the ISO date to prose ("as of March 2026") |
| `ai_ethics_10_doomsday.tex` | Doomsday Clock "89 seconds (Jan 2025)" (~line 243) | Check for a 2026 announcement |
| `ai_ethics_10_doomsday.tex` | Bostrom slide (~line 270) | FHI closed April 2024 — say "co-founded Oxford's Future of Humanity Institute (closed 2024)" |
| `ai_ethics_02_virtues.tex` | Australia minimum-age law (~line 1009) | Add early evidence on how the Dec 2025 rollout went — great fresh discussion material |
| `ai_ethics_03.free_speech.tex` | Platform user-count table (~line 456); EU AI Act status (~line 1026) | Refresh |

---

## P3 — Structural bugs

### 3.1 Lecture 4 section structure is broken
- **File:** `latex/ai_ethics_04_intellectual_property.tex`
- **Problems:**
  1. `\section{Part I: Philosophical Foundations}` (~line 373) appears **after** all the foundations content it describes, and contains only an article-mode paragraph and an empty `\subsection` — the TOC slide will show a ghost section.
  2. **Two different sections are both labeled "Part III"** ("Critiques and Abuses of IP" ~line 522 and "Market Power and Control" ~line 701).
  3. `\section{Part V: AI and Intellectual Property}` (~line 799) appears **before** `\section{Part IV: Beyond Traditional IP}` (~line 914).
- **Fix:** Renumber/reorder so the presented order is: Intro → Foundations → Digital Disruption → Critiques → Market Power → Alternatives (open source/CC) → AI & IP → Conclusion (AI last flows best into Lecture 7), and move the orphaned Part I `\mode<article>` paragraph up to where the foundations content actually lives. Easiest robust fix: drop the "Part N" prefixes entirely (the metropolis progress bar + TOC slides already communicate position), matching Lectures 1–3.

### 3.2 Duplicate "Nothing to Hide" coverage (Lecture 6)
- **File:** `latex/ai_ethics_06_privacy.tex`
- **Problem:** The argument is treated three times: "The 'Nothing to Hide' Argument" (~line 267), "The 'Nothing to Hide' Argument (Standard Form)" (~line 929), and "The 'Nothing to Fear' Response---Revisited" (~line 1059). The bullets overlap heavily (chilling effects, aggregation, power asymmetry appear in all three). The deck is also the longest in the course (~44 slides).
- **Fix:** Keep the Part I teaser short (2 bullets + "we'll return to this"), keep the Part IV standard-form treatment, and delete the "Revisited" slide (fold the Schneier quote into the standard-form slide).

### 3.3 Key-concepts frames promise content the deck never covered (Lecture 8)
- **File:** `latex/ai_ethics_08_work.tex` (~lines 913–916)
- **Problem:** The closing "Key Thinkers and Concepts" lists **Marx's four alienations** and **Braverman's deskilling** — neither appears anywhere in the slides. Students revising from the summary will be lost.
- **Fix:** Either add a short Marx-alienation slide in Part I (it fits naturally next to Arendt and would strengthen the deck) or cut those two entries.

### 3.4 Bibliography frames only exist in Lectures 10–12
- **Files:** all lectures
- **Problem:** L10, L11, L12 end with `\printbibliography`; L1–L9 cite with biblatex but never print references. Either is defensible; the inconsistency isn't.
- **Fix:** Add a `[allowframebreaks]{References}` frame with `\printbibliography[heading=none]` to L1–L9 (recommended — models citation practice for the final project), or remove from L10–12.

---

## P4 — Consistency and design

### 4.1 Standardize title metadata (course rename remnants)
- L1: `\subtitle{IT Ethics}`, `\author{Brendan Shea, PhD}`; L2–4: author Brendan Shea, institute "…\\Computing and AI Ethics"; **L5–12: `\author{Computing and AI Ethics}` with no human author at all.**
- **Fix (all 12 files):** uniform block —
  `\author{Brendan Shea, PhD}` / `\institute{Rochester Community and Technical College\\PHIL 1150: Computing and AI Ethics}`. Also retitle L1's title/subtitle away from "IT Ethics" (e.g., title "The History of Information Technology and Ethics", subtitle matching the others). Update the L1 header comment block too.

### 4.2 Standardize title-slide style
- L1–L8 put white `\titlepage` text directly over fractal images (legibility depends on the fractal); L9–L12 use a dark tcolorbox overlay, which always reads well.
- **Fix:** Adopt the tcolorbox overlay in all 12 decks. Best done by moving the whole title-slide construct into `lecture_preamble.tex` as a command, e.g. `\lecturetitleslide{images/fractal_01.png}`, so future changes are one edit.
- Also: **fractal reuse** — L10 and L12 both use `fractal_05.png` (as does L5); L11 reuses `fractal_06.png` (L6). Generate `fractal_09`–`fractal_12` with the existing script (`fractal generation script` is in repo per commit history) so each lecture has a unique cover.

### 4.3 Rename files with dots to underscores
- `ai_ethics_03.free_speech.tex` → `ai_ethics_03_free_speech.tex`; `ai_ethics_05.crypto.tex` → `ai_ethics_05_crypto.tex`.
- **Caution (LLM implementers):** grep the repo for references to the old names (Makefile/BUILD docs/README/CI) before renaming; use `git mv`.

### 4.4 Standardize `\documentclass` options
- L1–4: `[aspectratio=169]`; L5–12: `[aspectratio=169,11pt]`. Pick one (11pt everywhere, or move sizing into the preamble) so identical content renders identically across decks.

### 4.5 Reduce/eliminate `[shrink=N]` in Lectures 10–11
- `ai_ethics_10_doomsday.tex` and `ai_ethics_11_robot_rights.tex` use `shrink` up to **25**, which silently scales text so font sizes visibly vary slide to slide (bad for projection and accessibility).
- **Fix:** For any frame with `shrink > ~8`, split into two slides or cut text instead. The worst offenders: L10 "Ord's Risk Estimates" (shrink=16), "Bostrom" (18), "Campaign to Stop Killer Robots" (20), "Kargu-2" (20); L11 "R.U.R." (25), "Asimov" (20).

### 4.6 Standardize the discussion-prompt idiom
- Current mix: `\begin{alertblock}{?}` (L1–4), `\begin{alertblock}{Discussion}` (L5–7), `discussionbox` (L8–12), plus the preamble's unused `\discussionquestion` command.
- **Fix:** Use `discussionbox` (gold, clearly non-threatening) everywhere for discussion prompts; reserve red `alertblock` for genuine warnings/key tensions. This is a mechanical find-and-replace per file. Then delete or repurpose the now-unused `\discussionquestion`/`\discussion` aliases in the preamble.

### 4.7 Standardize the closing summary frame
- L1–L9: enumerate "Key Thinkers and Concepts"; L10–11: description-list "Key Concepts"; L12: a `conceptbox` "Key Points". The L10–11 description-list format is the strongest (bolded term → definition, good for studying).
- **Fix:** Convert all to the description-list "Key Concepts" format.

### 4.8 Stale preamble comment
- **File:** `latex/lecture_preamble.tex` (~line 76)
- **Find:** `% FiraSans has ~15% taller metrics`
- **Problem:** The font is IBM Plex Sans (line 28), not Fira. Comment describes a previous design.
- **Fix:** Update comment to reference plex-sans (verify the 0.88 baselinestretch is still the right value for Plex while you're there). Also consider deleting unused preamble commands: `\sectiondivider`, `quoteslide` (grep shows no uses).

---

## P5 — Pedagogy (worth doing, not blocking)

1. **Lecture 6 length.** ~44 content slides is the longest deck; combined with three "nothing to hide" passes (see 3.2), it likely overruns. After the 3.2 cut, consider trimming Part III (authoritarian states) — the Russia/other-states/Pegasus/exporting sequence is 5 slides that could be 3.

2. **Lecture 1: Mill/Marx framing is a simplification — say so.** Mill never wrote about the telegraph as such; the "optimist vs. pessimist" pairing is a useful pedagogical construct. One sentence ("we're using these thinkers as representatives of two enduring positions, not reporting a debate they actually had") inoculates against a student citing the slide as history. Same soft caveat could apply to Theuth (optimist) — the myth is Plato's own invention.

3. **Give Lecture 7 a "Key Thinkers"-style visual anchor for Searle/Dennett/Chalmers.** L7 covers the deepest philosophy in the course but is the most text-table-heavy deck. The `figurebox` bio cards (~lines 148–210) work well — consider one image slide (Searle or the Chinese Room) to break up Part III, matching the image cadence of other lectures (~2–3 images each; L7 has only Turing and Lovelace, both in the history half).

4. **Standard-form arguments: keep it up, and consider numbering them course-wide.** The `argumentbox` standard-form arguments are the best recurring pedagogical device in the course. L3 numbers them ("Argument 1…4"); most decks don't. A consistent "Argument N.M" scheme (lecture.number) would let exams and the final project reference them cleanly.

5. **Add one slide on AI companions/parasocial relationships to Lecture 11.** Final project topics #52 and #55 (Replika/Character.AI, the Character.AI lawsuits) have no lecture home; L11's relational-view section (Gunkel/Darling) is the natural place and would make the deck feel current rather than purely theoretical.

6. **Accessibility pass.** Several tikz diagrams encode meaning purely in red/green (L1 pattern diagram, L5 centralized/decentralized, L6 balance beam). For projection and colorblind students, add shape or label redundancy where cheap. Low effort: the boxred/boxgreen pairs already carry labels in most cases; audit the handful that don't.

7. **Handout/article mode is half-maintained.** L1–L9 have `\mode<article>` narrative blocks; they're rich in L1–L4, thinner later, and L10–L12 have only the single abstract paragraph. If the article build is actually distributed to students, backfill L10–12 section summaries; if it isn't, note that in `BUILD.md` so nobody sinks time into it.

---

## Suggested implementation order

1. P1 items 1.1–1.5 and 1.11 (mechanical, 30 min total).
2. P3.1 (Lecture 4 restructure) — do alone in one commit; verify TOC slides after.
3. P4.1–4.4 (metadata/title-slide/filename standardization) — one commit; rebuild all decks.
4. P1 items 1.6–1.10, 1.12–1.13 (require judgment/sources).
5. P2 sweep in August 2026.
6. P4.5–4.8 and P5 as time allows.

**Build check for LLM implementers:** after each commit, compile at least the touched decks
(`latexmk -pdf -interaction=nonstopmode <file>.tex` from `latex/`, with biber) and confirm
zero new "Overfull \hbox" warnings on edited frames and that `\printbibliography` resolves
(no `[?]` citations).
