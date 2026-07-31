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
- **File:** `latex/ai_ethics_03_free_speech.tex` (~line 980, in the `\mode<article>` block)
- **Find:** `ML's arguments for protecting speech`
- **Fix:** "Mill's arguments". (Only appears in article mode, but it prints in the reader/handout build.)

### 1.6 China Social Credit System — nuance to match current scholarship (Lecture 6) — DONE 2026-07
- **File:** `latex/ai_ethics_06_privacy.tex` (~lines 608–626, "China---The Surveillance State Model")
- **Problem:** The slide presents a unified national "scoring citizens on trustworthiness" system with rewards/punishments. Scholarship (Jeremy Daum/China Law Translate, MIT Tech Review, MERICS) shows this is largely a Western misconception: the real system is a fragmented mix of corporate pilots (many discontinued), court blacklists (the travel-ban mechanism), and regulatory records — mostly not an algorithmic citizen score. **Your own final project topic #26 asks students to debunk exactly this framing**, so the lecture shouldn't reinforce it.
- **Fix:** Reframe the bullet as "Social Credit System: often described in the West as a unified citizen score; in practice a patchwork of blacklists, pilots, and regulatory records — the surveillance is real, the 'score' mostly isn't." Attach the punishments (travel bans) to the court **judgment-defaulter blacklist** specifically. Keep the camera counts and Great Firewall content, which are accurate.

### 1.7 Luther printing-press quote — flag provenance (Lecture 1) — DONE 2026-07 (attribution softened + provenance note tying back to the Socrates/Plato irony)
- **File:** `latex/ai_ethics_01_history.tex` (~line 526)
- **Find:** `The art of book printing is the \textbf{last and greatest gift}`
- **Problem:** This quote circulates widely but its provenance is thin (attributed via a secondary German source; sometimes traced to Table Talk paraphrases). Verify against Clemen or soften to "attributed to Luther."
- **Fix (minimum):** Change attribution line to "attributed to Martin Luther" and keep the Clemen citation. If you can verify it, leave as is.

### 1.8 Trump deplatforming: "permanently ban" + missing reinstatement (Lecture 3) — DONE 2026-07
- **File:** `latex/ai_ethics_03_free_speech.tex` (~line 885)
- **Find:** `Twitter, Facebook, YouTube permanently ban sitting U.S. President`
- **Problem:** Only Twitter's ban was "permanent"; Facebook's was indefinite → 2-year suspension. All three reinstated the account by 2023, which students will know and which changes the case study.
- **Fix:** "…ban sitting U.S. President after Capitol riot (Twitter permanently; Facebook and YouTube indefinitely). All three accounts were reinstated by 2023." Consider adding a discussion beat: does reinstatement vindicate either side?

### 1.9 Unsourced attention statistics table (Lecture 2) — DONE 2026-07 (table now cites Gloria Mark and flags the screen-switching vs. attention-span distinction; deep-reading row cut; both tikz sketch-graphs labeled "illustrative")
- **File:** `latex/ai_ethics_02_virtues.tex` (~lines 527–540, table under "Premise 2a: The Attention Crisis")
- **Problem:** The 2004→2024 table ("attention span 2.5 min → 47 seconds", "deep reading 60 → 15 min/day", "150+ phone checks") is labeled only "approximate figures from attention research." The 47-second figure is Gloria Mark's screen-switching research (real but often misrepresented as "attention span"); the teen deep-reading row appears to be invented. In a course teaching intellectual virtue, unsourced stats are a liability.
- **Fix:** Cite Gloria Mark explicitly for the task-switching row and reframe it as "average time on a single screen before switching"; delete or source the other rows. Same concern applies to the hand-drawn empathy-decline and depression tikz "graphs" (~lines 725–737 and 898–910): add "illustrative, not to scale" to captions or rebuild from actual Konrath / CDC-YRBS data.

### 1.10 Haidt presented without the counter-evidence (Lecture 2) — DONE 2026-07 (new "But Is It Causal?" slide: Odgers / Orben & Przybylski critique + Haidt's reply)
- **Files:** `latex/ai_ethics_02_virtues.tex` (Premise 2a mental health, ~line 887)
- **Problem:** *The Anxious Generation* correlation-vs-causation critiques (Odgers' *Nature* review, Przybylski's work) are prominent and well known; presenting Haidt uncontested undercuts the deck's own "examine the evidence for each premise" framing. Lecture 12 models this well (Anderson vs. Ferguson) — Lecture 2 should match.
- **Fix:** Add one objection block: "Critics (Odgers 2024; Orben & Przybylski) argue the correlational evidence is weak and effect sizes small; the causal question is open." One slide or half-slide suffices.

### 1.11 Netherlands loot-box ban was overturned (Lecture 12)
- **File:** `latex/ai_ethics_12_games.tex` (~line 515)
- **Find:** `Belgium and the Netherlands banned loot boxes as gambling (2018).`
- **Problem:** The Dutch ruling (against EA/FIFA) was overturned on appeal in March 2022. Belgium's ban stands.
- **Fix:** "Belgium banned loot boxes as gambling (2018); a similar Dutch ruling was overturned on appeal in 2022."

### 1.12 Verify Do Kwon sentencing detail (Lecture 5) — VERIFIED 2026-07: 15 years (sentenced Dec 11, 2025, Judge Engelmayer, SDNY) — slide was correct. Lazarus figures confirmed against Chainalysis year-end data ($2.02B in 2025; $6.75B cumulative); Bybit heist hedged to ~$1.4–1.5B (year-end vs. contemporaneous valuation)
- **File:** `latex/ai_ethics_05_crypto.tex` (~line 934)
- **Find:** `Sentenced December 2025 to 15 years in prison`
- **Action:** Verify sentence length/date against reporting before reprinting (he pleaded guilty in Aug 2025; confirm the December sentencing outcome). Same slide: confirm the "$2.02B stolen in 2025" Lazarus figure is the final Chainalysis year-end number, not a mid-year estimate.

### 1.13 Per-transaction Bitcoin energy metric is contested (Lecture 5) — DONE 2026-07 (both the per-transaction and address-concentration caveats added)
- **File:** `latex/ai_ethics_05_crypto.tex` (~line 717)
- **Find:** `Single transaction: $\sim$1,400+ kWh`
- **Problem:** "Energy per transaction" divides total mining energy by transaction count — a methodology critics (and even Digiconomist's rivals at CBECI) call misleading, since mining energy doesn't scale with transactions. The wealth-concentration stat on the next slide ("2% of accounts hold 95%") has a similar flaw (exchange addresses hold many users' coins).
- **Fix:** Keep the aggregate TWh numbers (solid), and either cut the per-transaction line or add "(a contested metric — mining energy does not scale per transaction)." Add "(addresses ≠ people; exchanges hold pooled funds)" to the concentration slide. Both are good critical-thinking asides for this audience.

---

## P2 — Time-sensitive content to refresh before Fall 2026 — **SWEEP COMPLETED 2026-07-31**

All rows below were researched against current sources and applied. Highlights of what actually changed:

| File | Item | Outcome |
|---|---|---|
| `ai_ethics_04_intellectual_property.tex` | "AI Copyright Wars" slide | Rewritten. Stale "two courts found training fair use" claim replaced with the *Bartz* conduct split (training fair use / pirated-library retention **not**) on a new companion slide; added the $1.5B settlement (final approval July 2026), the S.D.N.Y. MDL, and the fact that **no appellate court has yet ruled**. Also updated the AI-authorship slide for *Thaler* cert denial (Mar 2026) and the "prompts alone don't confer authorship" position. |
| `ai_ethics_05_crypto.tex` | BTC market cap, Satoshi holdings | **Both were wrong by ~half.** BTC market cap $2T+ → ~$1.3T (mid-2026); Satoshi holdings $100–135B → reframed as "~5% of all Bitcoin that will ever exist" (staleness-proof) with a note that the 1.1M figure is a statistical inference. Added a volatility caveat. |
| `ai_ethics_05_crypto.tex` | CBDC table | Jurisdictions 134 → ~146; e-CNY 260M wallets/7T yuan → 230M personal wallets; digital euro "preparation" → in trilogue, pilot 2027 / issuance 2029; USA "Banned" → "Prohibited by executive order; statutory ban still pending". Added Nigeria (13M wallets, 98.5% never used) and an adoption-failure discussion beat. |
| `ai_ethics_06_privacy.tex` | Data broker stats, Clearview | Broker table refreshed (581 registered in CA; ~750 across five states) with a caveat that market-size estimates disagree by ~20%. Clearview: 30B → ~50B images; added the vacated equity-stake settlement (July 2026), unpaid EU fines, and current federal contracts. |
| `ai_ethics_07_ai.tex` | LLM timeline | Extended through 2026 (reasoning models, open weights, agents), vendor-neutral. The two developments that matter pedagogically were split onto a new slide: the open-weight cost shock, and capability itself beginning to constrain release. |
| `ai_ethics_09_impact.tex` | FDA device count; IEA | FDA count reframed as ">1,500 and rising" (the exact live total moves several times a year) plus the FDA's own caveat that the list is not comprehensive. IEA figures updated: 415 TWh (2024) → 485 TWh (2025) → ~950 TWh projected 2030. |
| `ai_ethics_10_doomsday.tex` | Doomsday Clock; Bostrom | Clock 89 → **85 seconds (27 Jan 2026), closest ever**, with the Bulletin's AI-in-nuclear-command-and-control rationale. Bostrom: FHI noted as closed 2024, added Macrostrategy Research Initiative and *Deep Utopia*. |
| `ai_ethics_02_virtues.tex` | Australia minimum-age law | Updated, plus a **new slide** ("Did It Work? Australia as a Natural Experiment") with seven months of outcome data — the strongest new discussion material in the course. |
| `ai_ethics_03_free_speech.tex` | Platform user counts; EU AI Act | Table refreshed with a note on why cross-platform comparison is dishonest (X has published nothing audited since 2022). EU AI Act updated for the Digital Omnibus: transparency rules live Aug 2026, **high-risk postponed to Dec 2027**. |

**Next sweep:** the fastest-moving items are the crypto figures, the FDA count, and the AI copyright litigation (the Third Circuit *Ross* decision could land mid-semester). Re-check those first.

---

## P3 — Structural bugs

### 3.1 Lecture 4 section structure is broken
- **File:** `latex/ai_ethics_04_intellectual_property.tex`
- **Problems:**
  1. `\section{Part I: Philosophical Foundations}` (~line 373) appears **after** all the foundations content it describes, and contains only an article-mode paragraph and an empty `\subsection` — the TOC slide will show a ghost section.
  2. **Two different sections are both labeled "Part III"** ("Critiques and Abuses of IP" ~line 522 and "Market Power and Control" ~line 701).
  3. `\section{Part V: AI and Intellectual Property}` (~line 799) appears **before** `\section{Part IV: Beyond Traditional IP}` (~line 914).
- **Fix:** Renumber/reorder so the presented order is: Intro → Foundations → Digital Disruption → Critiques → Market Power → Alternatives (open source/CC) → AI & IP → Conclusion (AI last flows best into Lecture 7), and move the orphaned Part I `\mode<article>` paragraph up to where the foundations content actually lives. Easiest robust fix: drop the "Part N" prefixes entirely (the metropolis progress bar + TOC slides already communicate position), matching Lectures 1–3.

### 3.2 Duplicate "Nothing to Hide" coverage (Lecture 6) — DONE 2026-07-31
- **File:** `latex/ai_ethics_06_privacy.tex`
- **Problem:** The argument is treated three times: "The 'Nothing to Hide' Argument" (~line 267), "The 'Nothing to Hide' Argument (Standard Form)" (~line 929), and "The 'Nothing to Fear' Response---Revisited" (~line 1059). The bullets overlap heavily (chilling effects, aggregation, power asymmetry appear in all three). The deck is also the longest in the course (~44 slides).
- **Fix:** Keep the Part I teaser short (2 bullets + "we'll return to this"), keep the Part IV standard-form treatment, and delete the "Revisited" slide (fold the Schneier quote into the standard-form slide).

### 3.3 Key-concepts frames promise content the deck never covered (Lecture 8) — DONE 2026-07-31
- **File:** `latex/ai_ethics_08_work.tex` (~lines 913–916)
- **Problem:** The closing "Key Thinkers and Concepts" lists **Marx's four alienations** and **Braverman's deskilling** — neither appears anywhere in the slides. Students revising from the summary will be lost.
- **Fix:** Either add a short Marx-alienation slide in Part I (it fits naturally next to Arendt and would strengthen the deck) or cut those two entries.

### 3.4 Bibliography frames only exist in Lectures 10–12 — DONE 2026-07-31
- **Files:** all lectures
- **Problem:** L10, L11, L12 end with `\printbibliography`; L1–L9 cite with biblatex but never print references. Either is defensible; the inconsistency isn't.
- **Fix:** Add a `[allowframebreaks]{References}` frame with `\printbibliography[heading=none]` to L1–L9 (recommended — models citation practice for the final project), or remove from L10–12.

---

## P4 — Consistency and design

### 4.1 Standardize title metadata (course rename remnants) — DONE 2026-07
- L1: `\subtitle{IT Ethics}`, `\author{Brendan Shea, PhD}`; L2–4: author Brendan Shea, institute "…\\Computing and AI Ethics"; **L5–12: `\author{Computing and AI Ethics}` with no human author at all.**
- **Fix (all 12 files):** uniform block —
  `\author{Brendan Shea, PhD}` / `\institute{Rochester Community and Technical College\\PHIL 1150: Computing and AI Ethics}`. Also retitle L1's title/subtitle away from "IT Ethics" (e.g., title "The History of Information Technology and Ethics", subtitle matching the others). Update the L1 header comment block too.

### 4.2 Standardize title-slide style — DONE 2026-07 (added `\lecturetitleslide` to the preamble; generated fractal_09–12 so every deck has a unique cover)
- L1–L8 put white `\titlepage` text directly over fractal images (legibility depends on the fractal); L9–L12 use a dark tcolorbox overlay, which always reads well.
- **Fix:** Adopt the tcolorbox overlay in all 12 decks. Best done by moving the whole title-slide construct into `lecture_preamble.tex` as a command, e.g. `\lecturetitleslide{images/fractal_01.png}`, so future changes are one edit.
- Also: **fractal reuse** — L10 and L12 both use `fractal_05.png` (as does L5); L11 reuses `fractal_06.png` (L6). Generate `fractal_09`–`fractal_12` with the existing script (`fractal generation script` is in repo per commit history) so each lecture has a unique cover.

### 4.3 Rename files with dots to underscores — DONE 2026-07
- `ai_ethics_03_free_speech.tex` → `ai_ethics_03_free_speech.tex`; `ai_ethics_05_crypto.tex` → `ai_ethics_05_crypto.tex`.
- **Caution (LLM implementers):** grep the repo for references to the old names (Makefile/BUILD docs/README/CI) before renaming; use `git mv`.

### 4.4 Standardize `\documentclass` options — DONE 2026-07 (11pt everywhere)
- L1–4: `[aspectratio=169]`; L5–12: `[aspectratio=169,11pt]`. Pick one (11pt everywhere, or move sizing into the preamble) so identical content renders identically across decks.

### 4.5 Reduce/eliminate `[shrink=N]` in Lectures 10–11 — ASSESSED 2026-07: NOT NEEDED. Rendered the worst offenders (R.U.R. shrink=25, Asimov/Campaign/Kargu shrink=20, Bostrom shrink=18); all read fine with whitespace to spare — the caps are conservative but the *actual* shrink beamer applies is mild, so there's no visible font-size problem. Ironically shrink is why L10/L11 have ~0 overflows. Leaving as-is. (Open follow-ups found while checking: a "Figure N: *" caption artifact on L10/11/12 image slides, and a broad content-overflow issue in L1–9/L12 — see notes below.)
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

2. ~~**Lecture 1: Mill/Marx framing is a simplification — say so.**~~ **DONE 2026-07-31** — caveat added to the "Who Were Mill and Marx?" slide ("we are using them as representatives of two enduring positions, not reporting an argument they actually had. Don't cite this slide as history."), plus a note on the Theuth slide that the myth is Plato's own invention.
   Original item:
   **Lecture 1: Mill/Marx framing is a simplification — say so.** Mill never wrote about the telegraph as such; the "optimist vs. pessimist" pairing is a useful pedagogical construct. One sentence ("we're using these thinkers as representatives of two enduring positions, not reporting a debate they actually had") inoculates against a student citing the slide as history. Same soft caveat could apply to Theuth (optimist) — the myth is Plato's own invention.

3. **Give Lecture 7 a "Key Thinkers"-style visual anchor for Searle/Dennett/Chalmers.** L7 covers the deepest philosophy in the course but is the most text-table-heavy deck. The `figurebox` bio cards (~lines 148–210) work well — consider one image slide (Searle or the Chinese Room) to break up Part III, matching the image cadence of other lectures (~2–3 images each; L7 has only Turing and Lovelace, both in the history half).

4. **Standard-form arguments: keep it up, and consider numbering them course-wide.** The `argumentbox` standard-form arguments are the best recurring pedagogical device in the course. L3 numbers them ("Argument 1…4"); most decks don't. A consistent "Argument N.M" scheme (lecture.number) would let exams and the final project reference them cleanly.

5. ~~**Add one slide on AI companions/parasocial relationships to Lecture 11.**~~ **DONE 2026-07-31** — added *two* slides after Gunkel's relational approach: "AI Companions: The Relational View's Hardest Test" (the Feb 2023 Replika filter episode as the anchor case, the HBS identity-discontinuity study, Common Sense Media teen-usage data, and the collision between the relational view and the stochastic-parrot critique) and "Can a Relationship with an AI Be Valuable?" (Danaher vs. Turkle/Sparrow, with Nyholm & Frank's particularity objection, closing on the fact that the 2025–26 companion-chatbot laws sidestep the philosophical question entirely). New bib entries added for Danaher, Sparrow, Nyholm & Frank, De Freitas et al., and Common Sense Media.
   Original item:
   **Add one slide on AI companions/parasocial relationships to Lecture 11.** Final project topics #52 and #55 (Replika/Character.AI, the Character.AI lawsuits) have no lecture home; L11's relational-view section (Gunkel/Darling) is the natural place and would make the deck feel current rather than purely theoretical.

6. **Accessibility pass.** Several tikz diagrams encode meaning purely in red/green (L1 pattern diagram, L5 centralized/decentralized, L6 balance beam). For projection and colorblind students, add shape or label redundancy where cheap. Low effort: the boxred/boxgreen pairs already carry labels in most cases; audit the handful that don't.

7. ~~**Handout/article mode is half-maintained.**~~ **Resolved 2026-07:** article mode is not used or maintained; noted in `docs/BUILD.md`. Do not extend `\mode<article>` blocks; they're harmless in the presentation build.

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

---

## Completed 2026-07-31 (this pass)

Beyond the P2 sweep and P3.2–3.4 above:

- **Caption bug, all 12 decks (was an open follow-up under P4.5).** `\caption*` is **not defined by beamer** — every `\caption*{Credit line}` was rendering as literal "Figure N: *" followed by the credit as body text. Confirmed by compiling a minimal test case. Fixed by configuring beamer's caption template in `lecture_preamble.tex` to drop the "Figure N:" label entirely (these captions are image credits, and nothing in the decks says "see Figure 3"), then converting all 40 `\caption*` calls to plain `\caption`. The preamble now carries a comment warning against reintroducing `\caption*`.
- **Slide overflow.** New content was trimmed until it stopped being the worst offender in its deck; four genuinely dense slides (L5 Bitcoin, L5 CBDC, L6 Nothing-to-Hide standard form, L6 Clearview) carry a modest `shrink`. Net change across all decks, measured by building HEAD and the new tree the same way: **180 → 176 overfull vboxes**, despite adding five new slides. The broad pre-existing overflow issue in L1/L3 (34 and 32) is **still open**.
- **Course documents.** Term rolled Spring → Fall 2026 in the syllabus, final project, and final exam. Syllabus: exam description now matches `final_exam.md` (published topics, handwritten notes, webcam); the project description now matches `final_project.md` (15–20 min video, not a "20-minute lesson"); added a scope note reconciling the official course outline with the twelve-lecture sequence students actually see. **The official Major Content Areas and Learning Outcomes were left untouched** — they look like Common Course Outline / MnTC text that shouldn't be rewritten unilaterally. Worth confirming.
- **Glossary** gained Braverman, alienation, and species-being entries to match the new Lecture 8 content.

### Verified by build
All 12 decks compile with `pdflatex` → `biber` → `pdflatex` ×2: **zero undefined citations, zero unresolved references**, bibliographies resolving in all twelve (they previously printed only in L10–12).

Note for future implementers: `biber` needs `BIBINPUTS` pointing at the project root, since `refs.bib` lives there and the build runs from the root with `TEXINPUTS=./latex`.

## Still open

- **P5.1** — Lecture 6 length. One slide was removed via 3.2, but the Part III authoritarian-states sequence is untrimmed.
- **P5.3** — Lecture 7 visual anchor for Searle/Dennett/Chalmers.
- **P5.4** — course-wide "Argument N.M" numbering.
- **P5.6** — accessibility pass on red/green-only tikz diagrams.
- **Broad slide overflow** in L1 (34) and L3 (32), which predates this pass.
(The HTML chapters were brought back into sync in the follow-up pass below.)

---

# HTML chapter pass — 2026-07-31

All twelve `html/ch*.html` readings were synced with the revised decks and given an
accuracy and style proofread. Each chapter was worked on independently, then the
highest-stakes corrections were re-verified by a separate reviewer.

## The thing to know: five fabricated or misattributed quotations

The chapters were derived from the slides with LLM assistance, and the
characteristic failure mode showed up exactly where you would fear it — in
quotations. In a course that teaches source evaluation, these were the most
damaging defects in the book:

| Chapter | What was there | What is true |
|---|---|---|
| 10 | A quotation attributed to **Narayanan & Kapoor** about present-day AI harms | **Unverifiable, almost certainly invented.** Replaced with the verified DAIR statement line. |
| 10 | A quotation attributed to **Shannon Vallor** closing the Synthesis | **Unverifiable, almost certainly invented.** Replaced with a verifiable line from *The AI Mirror*. |
| 1 | Mill "called this the **marketplace of ideas**" | Mill never used the phrase. It comes from 20th-century American free-speech law. |
| 3 | Brandeis's "more speech, not enforced silence" given as a **quotation** | It is a paraphrase. Replaced with the verbatim *Whitney* concurrence, including the load-bearing "If there be time…" condition. |
| 3 | "**27 times** as many abusive tweets" | Unverifiable anywhere; appears fabricated. Replaced with Amnesty International's *Troll Patrol* figures. |
| 12 | Two quotations attributed to **Bernard Suits** | Could not be verified against the text; both converted to paraphrase without quotation marks. |
| 2 | "We are what we repeatedly do…" attributed to **Aristotle** | **Will Durant's** paraphrase (1926) — the same error already fixed in the deck. |
| 8, 7 | Lovelace "has no power of originating anything" | Her actual wording is "has no pretensions whatever to originate any thing" (Note G, 1843). |

**Recommendation:** treat any remaining direct quotation in these materials as
unverified until checked. The pattern is that plausible-sounding paraphrases
acquire quotation marks. Worth a standing rule for future chapter drafting.

## Second pattern: ideas credited to the wrong person

- The **six characteristics of play** (free, separate, uncertain, unproductive, rule-governed, make-believe) were credited to **Huizinga**. They are **Caillois's**, from *Man, Play and Games* (1958). (Ch12)
- **"GOFAI"** was credited to McCarthy. The term is **John Haugeland's** (1985). (Ch7)
- **"Moral grandstanding"** was credited to Haidt. It is **Tosi & Warmke** (2016). (Ch2)
- **"Stochastic parrots"** was credited to "Gary Marcus and Emily Bender." Marcus is not an author of that paper. (quiz 7)
- The **responsibility-gap argument** was credited to Scharre; it originates with **Robert Sparrow** (2007). (Ch10)
- **"Magic circle"** as a term of art owes more to **Salen & Zimmerman** (2003) than to Huizinga, who uses the phrase in passing. (Ch12)

## Third pattern: positions misrepresented

- **Paul Scharre** was presented as an abolitionist who thinks autonomous weapons cross a line that must not be crossed. He is not — *Army of None* is skeptical that a comprehensive preemptive ban could be defined or verified, and he proposes a narrower anti-personnel ban. Corrected in prose, thinker card, Key Points, and a thought question. (Ch10)
- **Shannon Vallor's** argument had been replaced with **Torres and Gebru's** (that x-risk discourse serves institutional prestige and funding). Her actual case is the anthropomorphism error and the abdication of moral agency. (Ch10)
- The **Luddites** were described as machine-breakers; they were skilled workers protesting the degradation of craft, and the modern pejorative inverts their argument. (Ch8)
- The **violent-video-game** literature was presented as settled with a "current scientific consensus." It is genuinely contested; the APA narrowed its own position in February 2020. (Ch12)

## Navigation was broken in the second half of the book

Found by audit, not reported by anyone: a student reading straight through would
**fall off the end at Chapter 8**. Specifically —

- Ch8's "next" pointed at the table of contents (a leftover from when the book had eight chapters; `docs/CHAPTER_GUIDELINES.md` §10 still says "For ch08: make the Next button `.disabled`" and should be updated).
- Ch10 had **no "next" link at all**.
- Ch12's "previous" pointed at the table of contents instead of Ch11.
- Ch6's footer linked to `ch07_ai_ethics.html`, which **does not exist** (the file is `ch07_ai_intro.html`) — a 404.
- Ch2–Ch5 used `.footer-nav` / `.footer-license`, **neither of which is defined in `styles.css`** — those four footers rendered unstyled.

All twelve top and footer navs were regenerated from a single source so the chain
is complete and consistent.

## Quizzes contradicted the corrected chapters

The quizzes are auto-graded, so this was live: a student who learned the corrected
material would have been **marked wrong**. Sixteen corrections across eight quiz files.

- **quiz_12** had three questions resting on the false premise that the Netherlands banned loot boxes. The Dutch ruling against EA was **overturned on appeal in March 2022**; only Belgium's ban stands. One question's marked-correct answer was simply wrong. Rewritten so the Belgium/Netherlands divergence is itself the teaching point.
- **quiz_04** marked as true the over-coarse claim that "two federal courts found AI training highly transformative." Replaced with the *Bartz* conduct split.
- **quiz_10** said the *Bulletin of the Atomic Scientists* was founded by Manhattan Project physicists "including Albert Einstein and J. Robert Oppenheimer." Einstein never worked on the Manhattan Project (he was denied security clearance) and neither man founded the Bulletin — Rabinowitch and Goldsmith did.
- Plus: Clearview's database figure, e-CNY wallets, the FDA count, the Doomsday Clock, FHI's closure, and the Australia ban outcome data.

## Also done

- **Accessibility**: 51 `<th>` elements across ch02/ch03/ch05 gained `scope="col"`; two `h2 → h4` heading skips in ch03 fixed.
- **House style**: ch03 was the only chapter using `<h3>Pause and Reflect</h3>` + `<ul>` for thought questions; normalized to the `box-label` + `<ol>` pattern used by the other eleven and the template. ch12 was the only chapter not using the house `∴` conclusion markup in argument boxes.
- **Structural minimums** (guidelines §3) now met everywhere. Thought-question boxes went from 53 to 87 — ch12 had **one** box for eight sections. Case studies went 50 → 58 and argument boxes 50 → 54, filled in where short (ch09 had 1 argument box against a minimum of 3).
- **Malformed HTML** fixed in several chapters: doubled `</p>`, `<ul>` nested inside `<p>`, nested `<cite>` inside `<cite>`, duplicate ids, and quote blocks with hard-coded quotation marks that the CSS already supplies.
- **66 new BibTeX entries** added to `refs.bib` for the sources behind these corrections, followed by a pass attaching `<cite>` tags.
- **`.docx` exports regenerated** from the corrected HTML.

## Still open on the chapters

- **Chapter length — trimming pass IN PROGRESS.** See the section below.
- **Guidelines are stale in two places**: §4's file-naming table stops at Chapter 8 and lists `ch05_cryptography.html` / `ch07_ai_ethics.html`, neither of which is the real filename; §10 still describes an eight-chapter book.
- A handful of claims were deliberately **softened rather than deleted** because they could not be verified — flagged in each chapter's working notes. The one most worth a human check is the Vallor line quoted from *The AI Mirror*, which came from secondary reporting rather than the book.
- `ch07_ai_intro.html` keeps its filename (guidelines say `ch07_ai_ethics.html`); every sibling nav link points at the current name, so renaming would be a coordinated change.
- **The chapters are not actually self-contained**, which `CHAPTER_GUIDELINES.md` §2 says they must be for students without reliable internet. Every chapter loads Mermaid from the jsDelivr CDN. Verified by rendering all twelve in a headless browser with outbound access blocked: citations and bibliographies still resolved (`cite.js` reads a local file), but every Mermaid diagram failed to draw. Vendoring `mermaid.min.js` into the repo would close the gap; it is the only remaining external dependency.

### Verified end to end
All twelve chapters were rendered in a headless browser against a local server:
**every one of the 254 `<cite data-key>` tags resolves**, and each chapter's
reference list populates (7--31 entries). No unresolved-key markers and no
JavaScript errors other than the blocked CDN noted above.


---

# Trimming pass — started 2026-07-31

The author's verdict on the post-accuracy-pass chapters: **"students aren't going to
read this much."** The measurements back that up.

## What the numbers showed

Chapters were **at** the style guide's ceiling before the accuracy pass and went 38%
over it afterwards. The bloat is almost entirely from that pass, not pre-existing:

| | words |
|---|---|
| Before the accuracy pass (12 chapters) | 86,431 — i.e. ~7,200 each, right at the §12 ceiling |
| After it | 115,557 (**+29,126, +34%**) |
| Guideline ceiling (7,000 x 12) | 84,000 |

Where the 29,126 added words went:

| element | added |
|---|---|
| running prose | +15,377 |
| thought-questions boxes | +5,795 |
| case studies | +4,071 |
| key points | +1,179 |
| definition boxes | +692 |
| argument boxes | +653 |
| key thinker cards | +588 |
| objections / tables / pro-arguments | +771 |

Individual elements are mostly **within** their per-element budgets (case studies
average 247 words against a 300 ceiling; thinker cards average 194 against 250). The
problem is volume and verbosity, not fat boxes — which means the cure is compression,
not deletion.

## Target

**7,200 words per chapter** (86,400 total), i.e. back to roughly the pre-pass length
while keeping every accuracy correction. Measure with
`python3 scripts/check-chapters.py` for structure and a word count over `<main>`.

## Done so far

- **Thought-question boxes trimmed to three questions each** — 76 questions removed
  across 11 chapters, **-2,443 words**. Every one of the 86 boxes was read first: the
  question dropped was the most generic or the one duplicating a sibling, never the
  one tied to a chapter's specific evidence or to a correction. (Several boxes' *last*
  question is the sharpest, because the accuracy pass appended evidence-quality
  questions — blind truncation would have destroyed the best material.)
- Seven chapters also carry partial prose compression from an interrupted first
  attempt; those edits are good and were kept.

**Now at 112,477 words — still 26,077 over target.**

## What remains, in priority order

1. **Running prose (~15,000 of the overage).** The technique that works, from the
   partial edits: collapse appositive asides, merge clauses, and delete sentences that
   restate the one before. A worked example that loses nothing —
   *before (60w):* "That estimate comes from a 2021 analysis by researchers at Google
   and the University of California, Berkeley, not from OpenAI, which has never
   published figures of its own; it describes a single training run of a model that is
   now several generations old, and it tells us nothing about the far larger runs that
   followed."
   *after (28w):* "The estimate comes from outside researchers, not OpenAI, and covers
   a single run of a model several generations old — it says nothing about the far
   larger runs since."
   Both caveats survive; institutional detail and a repeated clause go.
2. **The 57 paragraphs over 150 words.** Median paragraph in the book is 84. These
   hold ~10,100 words and most can lose a third.
3. **Key Points bullets**, now averaging ~50 words each against a one-sentence
   intent — roughly 2,500 words recoverable across the book.
4. **Case studies over 250 words** — the Doomsday Clock (525w), Clearview (490w),
   Australia (419w), and loot boxes (417w) are the worst.
5. **Chapters 4 and 5 carry 8 and 6 case studies** against a §3 range of 3–5; the
   weakest could fold into surrounding prose.

## The rule that must not be broken

**Never cut a hedge or a correction to save words.** The accuracy pass is the reason
these chapters are trustworthy — every misattribution fixed, every "estimated"/"about"
qualifier, every caveat that stops a claim from being false, and every `<cite>` tag
stays. If a caveat is wordy, *compress* it. Chapters 1–12 each have a specific list of
untouchable items; they are recorded in the trimming briefs and are recoverable from
the corrections documented above.
