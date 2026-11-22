# Nihal Gupta: Portfolio

A static site (HTML, CSS and vanilla JS) with no build step.

```
index.html
assets/css/style.css
assets/js/main.js
assets/img/nihal.webp                 profile photo
assets/img/projects/*.webp            AI-generated project thumbnails (used by the site)
assets/img/projects/original/*.png    full-resolution 2K originals (local only, gitignored)
assets/Nihal-Gupta-Resume.pdf         linked from the "Résumé" buttons
tools/gen_thumbs.py                   thumbnail generator (local only, gitignored)
```

## Preview locally

```
python3 -m http.server 4173
# open http://localhost:4173
```

## Deploy

Upload the folder as-is to Vercel, Netlify, GitHub Pages or Cloudflare Pages. No build command is needed.

## Regenerating thumbnails

The thumbnails come from Gemini (`gemini-3-pro-image`) on Vertex AI.
Each project's screenshots are passed in as layout references. Edit the prompt for a project in
`tools/gen_thumbs.py`, then run:

```
python3 tools/gen_thumbs.py <screenshots_dir> <out_dir> flowdesk promptu   # slugs are optional
cwebp -q 82 -resize 1400 0 <out_dir>/flowdesk.png -o assets/img/projects/flowdesk.webp
```
