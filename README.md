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

## Adding the photos from the chat

The WhatsApp export didn't include the media files (images and voice notes show as "omitted"), so two image slots are ready to fill:

1. **Founder photo:** save it as `assets/founder.jpg` (portrait, about 6:7). Until it exists, the card shows neon "MS" initials.
2. **Gallery (offers, posters, customer feedback):** put the images in `assets/gallery/` and list them in `js/data.js`:

   ```js
   gallery: [
     { src: 'assets/gallery/offer-01.jpg', alt: 'عرض Gemini Pro' },
     { src: 'assets/gallery/review-01.jpg', alt: 'رأي عميل' },
   ],
   ```

   The gallery section, with a lightbox, appears automatically once the list has items.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy

It's a static site, so any static host works: GitHub Pages (Settings → Pages → deploy from branch, root), Netlify, Vercel or Cloudflare Pages. No build command; the output directory is the repo root.
