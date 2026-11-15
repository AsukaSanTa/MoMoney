# MoMoney

A web product for pregnant women and new moms in the US (B2C, web only). It helps moms find financial help, save money on baby essentials, and connect with other moms.

**Live demo:** https://momoney-seven.vercel.app (no sign-up or login needed)

## The problem
Pregnancy and the first months with a baby are expensive, and the paperwork for financial help is confusing. Moms also buy gear that their baby outgrows in weeks.

## What it does
- **Help programs**: choose your state and what you need, and see financial help you may qualify for (health coverage, cash and tax credits, paid leave, bills and baby supplies), with links to the official sites.
- **Marketplace**: sell or rent baby gear, with photos. Nannies and sitters are a subcategory, and each sitter has a detailed profile page (experience, languages, certifications, availability).
- **Cheap stores**: lowest prices for newborn and pregnancy items in your city, shared by moms and sorted from cheapest.
- **Community**: a safe space to ask questions and share support.
- **AI assistant**: a chat in the bottom right corner on every page that answers questions.

## Business model
A small fee on marketplace sales, plus a premium plan (deadline reminders for help programs, priority listings).

## Tech
- Frontend: a single `index.html` (HTML, CSS, JavaScript), no build step.
- Backend: one serverless function, `api/chat.js`, for the AI assistant (Google Gemini API). It keeps the API key secret.
- Hosting: Vercel, deployed from this repository.

```
index.html     the whole frontend
api/chat.js    serverless function for the AI assistant
```

## Run it yourself
1. Open `index.html` in a browser to use everything except the AI assistant.
2. To enable the assistant, deploy the repo on Vercel and add the environment variable `GEMINI_API_KEY` (free key from https://aistudio.google.com/apikey). Optional: `GEMINI_MODEL`, or `ANTHROPIC_API_KEY` to use Claude instead.

## Current limitations and next steps
- Listings, posts and prices are stored in the browser (`localStorage`) through the `DB` object at the top of the script, so they are not yet shared between users. Next step: replace `DB` with Supabase or Firebase.
- Sample listings, posts, sitter profiles and prices are demo data.
- Sitters are not verified yet. Next step: identity and reference checks.
- Help program details change over time, so users are always sent to the official site to confirm eligibility.
