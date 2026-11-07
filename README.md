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

**No external code, CDN, fonts, login or network API is needed.** PDF supplements preserve the original layout and figures; the revision reader provides a mobile-reflowed transcription. When numbers or tables matter, use the formatted PDF.

## Publish to GitHub Pages

1. Create a new GitHub repository (for example `mimpdent-rcsed-study`).
2. Extract this ZIP on your computer. Upload **all files and subfolders inside** `M_Imp_Dent_RCSEd_GitHub_Offline/` to the root of the repository — keep the folder structure.
3. Commit the files to the `main` branch.
4. In the GitHub repository open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**. Set `main` and **`/(root)`**, and save.
5. Open the GitHub Pages URL displayed in repository Settings. It will generally look like `https://USERNAME.github.io/REPOSITORY/`.
6. Open `index.html`, `revision.html` or `quiz.html` in Safari. Links work using relative paths in any GitHub Pages repository name.

### Offline on iPhone and iPad

1. **Connect to Wi-Fi** and open the GitHub Pages URL in **Safari**.
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. Launch the new Home Screen icon **once while online** and let the website complete its initial load. The offline worker pre-caches all app files, question data, notes and five PDF supplements (roughly 20 MB total). The home page status changes to **Offline copy ready** when the main files are found.
4. You can then put the device in Airplane Mode and use the Home Screen app offline. The local app keeps your SBA progress on that device.

**Important limitations:** Installing a PWA and caching through a service worker requires an HTTPS website, such as GitHub Pages. Simply opening `index.html` through iOS Files does not install its service worker. A downloaded folder works as local HTML on a laptop; for iPhone/iPad, use GitHub Pages + Add to Home Screen. iOS may evict website caches after storage pressure or prolonged non-use; revisit once online to restore. Do not delete the Home Screen app or clear website data unless your progress is backed up.

### Export and import progress

The quiz keeps answers and bookmarks in the browser's local storage. It **does not sync between iPhone and iPad**. Use **Export progress** on one device and **Import progress** on the other to move progress, or to keep a backup. Import **replaces** progress on the receiving device, rather than merging it.

### Offline without hosting

On a laptop/computer, extract the ZIP and open `index.html`. Because the structured content is loaded as local `.js` files rather than fetched from the internet, the HTML notes and interactive quiz work without a server. PDFs can be opened locally. For iPhone/iPad use the installation procedure above.

**Source consistency note:** The source PDF has an older introductory line describing 300 SBAs and 40 OSCE/SOE stations. Its cover, contents, and actual question/case sections establish the updated totals of **800 SBAs, 58 OSCEs and 51 structured oral cases**. The original PDF text is left unchanged.

## Content validation

The extraction process verified **800 unique question numbers (1–800)**, **five A–E options per question**, **800 matching explanation records**, **24 blueprint blocks** and **16 indexed revision sections**. Source PDF boundaries and page counts appear in `qa_manifest.json`.

No new clinical claims have been inserted. The material in the study site is reproduced from the supplied PDF. Clinical advice and professional regulations may change: verify against current guidance before treating patients.

## Copyright and privacy

The source author retains their rights. You are responsible for having permission to publish the provided material in a public GitHub repository. For personal use or limited distribution, consider a private repository and a separate private hosting arrangement (standard GitHub Pages sites may be publicly accessible). No personal study history leaves the browser; progress export produces a JSON file on your device.
