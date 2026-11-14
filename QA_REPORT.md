# QA report — M Imp Dent RCSEd v3

**Design reference:** `https://drowenkam.github.io/DSFE-Fpros/#home` (layout and navigation only).

## Verified source integrity and file checks

- **800** consecutively numbered, unique SBAs, all with five A–E options, valid correct answers and explanations.
- **24** clinical question blocks, matching the 800-question source bank without gaps or overlaps.
- **82 / 82** original revision pages searchable and available as exact-page WebP images in seven cacheable bundles.
- **58** indexed OSCE stations and **51** indexed SOE clinical cases, with corresponding source PDF page links.
- Original PDFs retained: **82 + 145 + 121 + 195 + 408 = 951 pages**.
- Navigation/link and static asset checks passed, including all seven portal views, the offline core file list, legacy redirects, manifest, and 7 page-image groups.
- JavaScript syntax validation of core scripts and the page-image/data bundles passed.

## Scoring interaction tests

A direct JavaScript-engine harness exercised the unmodified original progress format and the new SBA controls:

1. Create a deterministic ten-question practice set.
2. Choose A and mark a correct answer; verify marking and source explanation.
3. Pause, exit, resume, and finish with nine unchecked: **1 / 10 = 10% session score**, with **100% accuracy among checked answers**.
4. Check persisted question attempt in local storage.
5. Select no clinical blocks; verify session start is disabled. Select a block; verify available-pool recovery.
6. Enable 90-question exam simulation and verify **120-minute timed mode** is selected, explanations remain hidden until submission, and a two-answer / 90-question result is calculated from the full denominator.
7. Validate independent scoring extremes: **800/800** correct, **0/800** correct, and **1/10** partially answered.

**Automated static audit:** See `qa_results.json` for the exact number of checks and their names.

## Device/browser limitations

A physical iPhone/iPad and live GitHub Pages publication are **not available** in this build environment. Headless Chromium refused local navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`, so no claim is made that visual layout, touch interaction, service worker installation or actual Airplane Mode operation has passed a live browser test. The code and assets were audited and the scoring JavaScript was exercised in a simulated DOM; a final Safari smoke test is recommended after upload.

## Intended mobile smoke test

Open the published `healthcheck.html` and confirm all required files are accessible. Then on iPhone/iPad check Home → Dashboard → Revision (page 21, search and next page) → SBA (choose a block, mark a question, resume) → OSCE → SOE → Resources. Save the notebook page bundles offline, enable Airplane Mode, and repeat. Export SBA progress before any further website replacement.
