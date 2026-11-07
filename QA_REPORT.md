# Quality assurance report — SBA Study Hub, audited release

**Source:** `M_Imp_Dent_RCSEd_Revision_Notebook_3.pdf` (951 pages)  
**Site release:** 2.0, 7 November 2026  
**Scope:** source integrity; 800-question scoring and attempts; navigation; local save/resume; backup/restore; offline cache logic.

## Verified source integrity

- All **800 question IDs, 1–800**, are present, in order, with exactly five A–E options and a single valid keyed answer.
- All 800 questions have a nonempty explanation and a source reference to the relevant original question/answer page.
- All 800 questions map to exactly one of the 24 topic blocks.
- The `data/*.js` files match their corresponding `data/*.json` files.
- There are 16 mobile revision sections.
- Every one of the 951 original PDF pages was compared against its counterpart in the five split PDF volumes using extracted page text. No missing or differing pages were detected. PDF volumes contain 82 + 145 + 121 + 195 + 408 = **951 pages**.
- All HTML links to local styles, scripts, icons and PDFs resolve within the package.

## Automated quiz logic tests — 20 passed

1. Blank/fresh progress and 24 topic totals.
2. A blank answer cannot receive a mark, and double-checking cannot double-count a question.
3. A complete example of **1 correct / 10 assigned = 10% score**, but **1 correct / 2 checked = 50% checked accuracy**.
4. Retaking an incorrect question increments attempt count, updates latest accuracy, and preserves the first answer.
5. Progress, bookmarks and most recent results persist after a simulated page restart.
6. An answer selected but not checked persists in an unfinished session and is *not* counted as answered.
7. A question opened from the browser cannot silently discard an unfinished session; cancelling retains it.
8. Confirmed replacement from the browser gives a working one-question session.
9. Reset clears question history, bookmarks and unfinished session.
10. Timed sessions pause on **Save and exit**, and resume with their remaining time.
11. Expired timed sessions display results and retain an exit to the setup screen.
12. Existing v1 saved-answer records remain readable.
13. v2 JSON export includes history and version.
14. v2 import correctly restores graded question history.
15. Previous v1 JSON backups remain importable.
16. Import validation does not count malformed A–E answers or out-of-range IDs.
17. An exported unfinished timed session can resume from its question index on import.
18. Full correct-answer traversal of **all 800 questions** reaches the end without a dead end; score **800/800 = 100%**.
19. An empty “Not yet checked” pool displays a clear message instead of trapping the user.
20. Second full traversal with all 800 answers wrong gives **0/800 = 0%** for that session and for latest-answer accuracy, with first-attempt accuracy remaining unchanged.

## Offline worker tests — 7 passed in a simulated service-worker environment

- Essential HTML, JavaScript, CSS, question and revision files cache before PDF attempts.
- Old versioned cache is cleaned up after an update.
- Failure to download even *all five PDFs* does **not** break the core offline app.
- Core quiz and revision content can be fetched from cache when the simulated network is offline; an uncached PDF returns a clear error rather than an unrelated HTML page.
- Retrying can cache all five PDFs and report `5 of 5` accurately.
- Cached PDFs support HTTP byte-range requests (including suffix and invalid ranges), which helps PDF readers.
- An unknown offline navigation URL returns a safe Home fallback.

## Scoring definitions

- **Checked:** Unique questions with a selected A–E option and an explicit “Check answer & explain” action. Mere selection is not graded.
- **Latest accuracy:** Among all uniquely checked questions, the percentage whose most recent graded attempt is correct.
- **First-attempt accuracy:** Among those same uniquely checked questions, the percentage whose **first recorded** graded attempt was correct. For legacy v1 history without past retries, the historical latest answer is treated as its first recorded answer because earlier attempts cannot be reconstructed.
- **Session score:** Correct answers / **all questions assigned to the session**, counting unchecked questions as zero.
- **Checked-only session accuracy:** Correct answers / graded questions in that session, excluding unchecked questions from the denominator.
- The per-topic completed count and the 800-question completed count are **unique question counts**, not attempts. Retakes do not inflate the number of completed questions.

## Remaining device limitations

- Functional checks above ran as automated JavaScript logic tests and an isolated service-worker simulation. **They are not a substitute for a live Safari, physical iPhone/iPad, or end-to-end real-browser test**. The managed Chromium browser available for this audit disallows visiting local pages, so it was not used to claim visual-device or live-browser test results.
- iOS may evict offline cache files when storage is low. The homepage explicitly reports how many PDFs are actually cached; the smaller SBA/HTML study package installs independently of large PDFs.
- Device progress uses browser-local storage and does **not** automatically synchronise between iPhone and iPad. Export/import the JSON backup to transfer or safeguard it.
- A Home Screen installation and a Safari tab can have separate storage on some iOS versions; do not assume their progress is shared.
- This is a revision aid, not an official RCSEd publication or a substitute for current clinical guidance.

**Recommended acceptance test on your own device:** Publish the updated site, export any existing progress first, answer and mark two questions (one correct, one wrong), use **Save and exit**, reopen, confirm counts, and then switch on Airplane Mode and test the quiz and revision pages. For the five PDF supplements, verify that the homepage reports `5 of 5` before expecting all PDFs to work offline.
