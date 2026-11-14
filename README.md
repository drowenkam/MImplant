# M Imp Dent RCSEd — FPros-style study portal · v3

**Complete replacement website.** Based on the visual hierarchy and navigation of the author's existing DSFE-FPros GitHub Pages site, while using **only** the uploaded `M_Imp_Dent_RCSEd_Revision_Notebook_3.pdf` for implant dentistry study content.

## Contents

- `index.html` — unified Home / Dashboard / Revision / 800 SBAs / 58 OSCE / 51 SOE / Resources portal.
- `quiz.html` and `revision.html` — backwards-compatible redirects to the appropriate sections of `index.html`.
- `data/questions.js` — all 800 original SBAs, A–E choices, answer keys and explanations.
- `data/revision.js` — searchable text of **all 82 guide pages** (with 17 chapter/intro sections).
- `data/cases.js` — the full extracted text of 58 OSCE stations and 51 SOE cases; source PDFs retain diagrams and original formatting.
- `assets/page-00.js` through `assets/page-06.js` — images of **all 82 original revision pages**, grouped to keep the GitHub file count manageable.
- `pdf/` — the same **951 source pages** in five separate PDFs, with original layout and case illustrations.
- `sw.js` — service worker, supporting core offline study and optional PDF downloads.
- `healthcheck.html` — page for checking files after publishing.
- `qa_results.json` and `QA_REPORT.md` — file/data/scoring QA results and limitations.

## Update an existing GitHub Pages website (recommended)

1. **First, export your existing SBA progress** from the old site's SBA screen, keeping the JSON safe.
2. On your computer, open your local cloned GitHub Pages repository with GitHub Desktop.
3. Back up the repository folder. Remove the **old website files**, but **do not delete `.git`, `.github`, or `CNAME`** if present. Do not delete the repository itself.
4. **Extract this ZIP**, then copy **all its contents directly to the repository root**. `index.html`, `site.css`, `portal.js`, `sw.js`, `data/`, `assets/`, and `pdf/` must be directly beside one another. **Do not add an extra nested folder.**
5. Commit the changes and **Push origin**.
6. In GitHub, **Settings → Pages**, verify publishing is from `main` and `/(root)` if you use branch deployment.
7. When deployment completes, open `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/healthcheck.html`. All checks should report success. Then open the website `index.html#home` in a private window to check the latest layout.

**GitHub web upload:** Upload the extracted *files*, not the ZIP file. Files in this package are far below GitHub's 25 MB individual browser-upload limit. The reference page images are in seven manageable JS files rather than 82 separate images.

## iPhone and iPad offline use

1. Open the new GitHub Pages address in **Safari** while connected to Wi-Fi.
2. Use **Share → Add to Home Screen** and open the installed icon while online once. Check the Resources tab for **Offline essentials**. SBA questions, searchable note text, and case readers are core files cached automatically by the service worker.
3. For the **formatted page images**, visit **Resources → Save all original notebook pages offline** (7 groups). Optional PDFs may be cached separately using **Save 5 PDFs offline** (storage permitting).
4. To verify on a particular iPhone or iPad, enable **Airplane Mode** and then test Home, Revision, SBA, OSCE, and SOE navigation. Physical Safari/Airplane Mode behaviour must be tested on the device; desktop or simulated tests do not guarantee it.
5. SBA progress is saved **in local browser storage**. It does **not** sync automatically between iPhone and iPad. Use **Export progress** and **Import progress** in the SBA view to transfer.

## SBA scoring and workflow

- Distinguishes **completed unique questions out of 800**, **first-attempt accuracy**, and **latest-answer accuracy** after retries.
- Supports the original 24 question blocks, **multiple blocks at once**, new/incorrect/bookmarked questions, shuffled selection and 10/20/40/80/90 question sets.
- **Study mode** checks one selected answer at a time and reveals its source explanation. Unchecked questions count as zero toward a finished session's total score.
- **Timed practice** allows 80 seconds per assigned question, with pause-and-resume through Save and exit.
- **Exam simulation** selects 90 questions for 120 minutes and hides correct answers/explanations until submitted. Blank questions count as incorrect. The timer can be paused if the session is saved and exited, so it is a practice simulation rather than a proctored examination.
- The earlier version's localStorage key (`mimpdent-study-progress-v1`) is retained to preserve existing progress under the same browser origin. Export as backup before any replacement.
- In the case readers, "Mark as studied" records **completion only**, not an independently graded OSCE/SOE result.

## Source and clinical limitations

The source is the candidate's supplied revision notebook. The material is an independent revision aid, not an official RCSEd publication. Content was **not clinically revalidated** against external guidelines in this rebuild. Refer to the formatted source PDFs for complex tables/figures. The DSFE-FPros link was used for **layout, UI navigation and practice workflow inspiration only**, not to substitute Fellowship prosthodontic material into the implant-dentistry question bank.
