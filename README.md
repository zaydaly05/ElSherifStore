# El Sherif Store — Portfolio Website

A neon, tech-themed one-page website for **El Sherif Store** and its founder **Mohamed El Sherif**: AI tools and digital-service subscriptions.
It is Arabic-first and right-to-left, with no build step: plain HTML, CSS and JavaScript.

## What's on the page

| Section | Content |
|---|---|
| Hero | Headline, typing effect cycling through the tools, WhatsApp CTAs, quick stats, animated "AI core" orbit and network canvas |
| About the founder | Bio, the El Sherif Store story, vision, beliefs and the signature quote |
| Subscriptions | 9 products (ChatGPT, Gemini Pro, Claude, Perplexity Pro, SuperGrok, CapCut Pro, Canva Pro, ElevenLabs, LinkedIn Premium Career) with category filters. Each card opens a full details modal: every feature group, plans/durations, store perks and the usage note |
| Compare plans | ChatGPT GO / PLUS / PRO 5X and Claude Pro / Max 5X |
| Find your tool | Pick a profile (student, developer, creator, researcher, business owner, job seeker) and get recommended tools |
| Why us / How it works | Trust points and the 5-step subscription flow |
| Telegram band + Contact | Store WhatsApp, the founder's direct line, Telegram offers channel, Facebook page |

All WhatsApp buttons open a chat with a pre-filled message, and the product buttons name the product.
To deep-link to a product, add its id after `#`, for example `index.html#claude` or `index.html#gemini`.

## Structure

```
index.html        page markup
css/style.css     neon theme, layout and responsive rules
js/data.js        ALL content: contacts, products, plans, comparisons, profiles, gallery
js/main.js        rendering and interactions
assets/           favicon, founder photo, gallery images
```

Edit offers, features, durations or phone numbers in **`js/data.js`**. You don't need to touch the layout code.

## Photos

- **Founder photo:** `assets/founder.jpg`. If the file is missing, the card falls back to neon "MS" initials.
- **Customer reviews:** 80 screenshots in `assets/gallery/`, listed in `js/data.js` → `gallery`. To add one, drop the image in `assets/gallery/` and add a line to that list. They play in a 3D carousel: autoplay, swipe, arrows and keyboard, with a tilt-and-glare effect on the front card. Clicking the front card opens it full-screen. A "عرض كل الآراء" button opens the full grid.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy

It's a static site, so any static host works: GitHub Pages (Settings → Pages → deploy from branch, root), Netlify, Vercel or Cloudflare Pages. No build command; the output directory is the repo root.
