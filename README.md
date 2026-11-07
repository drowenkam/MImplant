# M Imp Dent RCSEd — Offline Revision & 800 SBA Study Hub

Prepared from the provided **M_Imp_Dent_RCSEd_Revision_Notebook_3.pdf**. Original revision notebook by **Dr. Kam O Man, Owen**.

**Important:** Independent revision aid; it is not an official publication of, nor endorsed by, the Royal College of Surgeons of Edinburgh.

## What is inside?

- `index.html` — home page; start here.
- `revision.html` — searchable HTML revision library (examination guidance, 12 core topics, numbers/classifications, literature).
- `quiz.html` — 800 interactive SBAs, each with five original options, key, explanation, 24 topic blocks, bookmarking, study progress, timed sessions, and import/export of progress.
- `pdf/01_Revision_Guide.pdf` — original formatted revision guide including cover and author (82 pages).
- `pdf/02_SBA_800_Questions.pdf` — questions only (145 pages).
- `pdf/03_SBA_800_Answers_Explanations.pdf` — answers and teaching explanations (121 pages).
- `pdf/04_OSCE_58_Stations.pdf` — 58 OSCE stations (195 pages).
- `pdf/05_SOE_51_Cases.pdf` — 51 structured oral cases (408 pages).
- `data/` — structured JSON plus script-ready copies of the exact source questions/notes.
- `sw.js`, `manifest.webmanifest` — offline support and Home Screen installation.
- `qa_manifest.json` — extraction counts and original page ranges.
- `QA_REPORT.md` — checked workflows, data integrity and known device limitations.

**No external code, CDN, fonts, login or network API is needed.** PDF supplements preserve the original layout and figures; the revision reader provides a mobile-reflowed transcription. When numbers or tables matter, use the formatted PDF.

## Publish to GitHub Pages

1. Create a new GitHub repository (for example `mimpdent-rcsed-study`).
2. Extract this ZIP on your computer. Upload **all files and subfolders inside** `M_Imp_Dent_RCSEd_GitHub_Offline_DEBUGGED_v2/` to the root of the repository — keep the folder structure.
3. Commit the files to the `main` branch.
4. In the GitHub repository open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**. Set `main` and **`/(root)`**, and save.
5. Open the GitHub Pages URL displayed in repository Settings. It will generally look like `https://USERNAME.github.io/REPOSITORY/`.
6. Open `index.html`, `revision.html` or `quiz.html` in Safari. Links work using relative paths in any GitHub Pages repository name.

### Offline on iPhone and iPad

1. **Connect to Wi-Fi** and open the GitHub Pages URL in **Safari**.
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. Launch the new Home Screen icon **once while online** and let the website complete its initial load. The offline worker first saves the core HTML pages, SBA question data, notes and required scripts. It then attempts to save the five PDF supplements separately (roughly 18 MB more). The home screen displays the exact count of PDFs saved, and you can press **Save PDFs offline / retry**. If iOS storage blocks a large PDF, the quiz and notes can still work offline.
4. You can then put the device in Airplane Mode and use the Home Screen app offline. The local app keeps your SBA progress on that device.

**Important limitations:** Installing a PWA and caching through a service worker requires an HTTPS website, such as GitHub Pages. Simply opening `index.html` through iOS Files does not install its service worker. A downloaded folder works as local HTML on a laptop; for iPhone/iPad, use GitHub Pages + Add to Home Screen. iOS may evict website caches after storage pressure or prolonged non-use; revisit once online to restore. Do not delete the Home Screen app or clear website data unless your progress is backed up.

### Export and import progress

The quiz keeps uniquely checked questions, first and latest graded answers, retry counts, bookmarks and a saved practice session in the browser's local storage. It **does not sync between iPhone and iPad**. Use **Export progress** on one device and **Import progress** on the other to move progress, or to keep a backup. Import **replaces** progress on the receiving device, rather than merging it; it also restores any exported unfinished session. Backups from the previous version are accepted, although they cannot reconstruct old repeat-attempt counts.

### Offline without hosting

On a laptop/computer, extract the ZIP and open `index.html`. Because the structured content is loaded as local `.js` files rather than fetched from the internet, the HTML notes and interactive quiz work without a server. PDFs can be opened locally. For iPhone/iPad use the installation procedure above.

**Source consistency note:** The source PDF has an older introductory line describing 300 SBAs and 40 OSCE/SOE stations. Its cover, contents, and actual question/case sections establish the updated totals of **800 SBAs, 58 OSCEs and 51 structured oral cases**. The original PDF text is left unchanged.

## Content validation

The extraction process verified **800 unique question numbers (1–800)**, **five A–E options per question**, **800 matching explanation records**, **24 blueprint blocks** and **16 indexed revision sections**. Source PDF boundaries and page counts appear in `qa_manifest.json`.

No new clinical claims have been inserted. The material in the study site is reproduced from the supplied PDF. Clinical advice and professional regulations may change: verify against current guidance before treating patients.

## Copyright and privacy

The source author retains their rights. You are responsible for having permission to publish the provided material in a public GitHub repository. For personal use or limited distribution, consider a private repository and a separate private hosting arrangement (standard GitHub Pages sites may be publicly accessible). No personal study history leaves the browser; progress export produces a JSON file on your device.

## Audited release: scoring and navigation fixes (7 November 2026)

This release corrects question-progress accounting and removes several potential dead ends.

- **Unique completed count (out of 800):** only questions you explicitly **check** with an A–E choice count as answered.
- **Latest accuracy:** correctness of the most recent graded answer for each uniquely checked question.
- **First-attempt accuracy:** correctness of the first recorded graded answer for each uniquely checked question, retained across retries.
- **Session score:** number correct divided by **all questions assigned**, so skipped or unchecked questions count as zero on that session's score. **Checked-only accuracy** is shown separately.
- **Progress by topic:** expand **Progress by topic (24 blocks)** to see checked and remaining counts in each blueprint block.
- **Navigation:** jump directly to any question in the current session, or tap **Next unchecked**. The last question offers **Finish & score**. Finishing with unchecked questions requires confirmation; the results screen offers separate retry/complete actions.
- **Recovery:** Save and exit keeps ungraded selections and question position. Timed practice pauses on this action, then resumes from the remaining time. A saved session is never silently replaced by opening a browser item.
- **Backup:** Export now includes graded history, bookmarks, most recent results, and an unfinished session. Old progress files from the previous version remain importable. Import still **replaces** rather than merges progress.
- **Offline:** the app caches the essential HTML notes and SBA player first; optional large PDFs cache separately. The homepage states precisely **0–5 PDFs saved**, with an explicit retry action. The worker handles offline PDF byte ranges.
- **Revision reader:** when a term is not found in the selected topic, the page now offers Clear search and links to matching topics.

See `QA_REPORT.md` for reproducible checks, scoring definitions and limitations.

### Updating an existing GitHub Pages repository

1. From your current version, **export a progress JSON backup** first, if you have completed practice questions.
2. Extract the new ZIP and replace the previous repository files and folders **with the contents of this new package**; commit to the same branch used by GitHub Pages. Preserve the folder structure; do not upload just the ZIP itself.
3. In Safari, reopen your existing Pages URL while online and reload again after the updated service worker activates. A brief period of old cached content while the new version installs is normal.
4. Your saved progress is designed to remain intact because the browser storage key and question IDs have not changed. Verify the counts; if needed, use **Import progress** to restore your backup. Do not clear Safari site data or delete the Home Screen app just to update it.
5. Wait for the Home page to report **Offline SBA + notes ready**; if you want all five PDF supplements offline, keep Wi-Fi connected until the separate PDF counter reaches **5 of 5**, then test in Airplane Mode.
