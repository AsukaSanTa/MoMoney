# MoMoney

A web product for pregnant women and new moms in the US (B2C, web only).

## What it does
- **Help programs**: find financial help by state (health coverage, cash and tax credits, paid leave, bills and baby supplies).
- **Swap and rent**: sell or rent baby gear, with photos.
- **Nannies**: sitter ads from local caregivers.
- **Cheap stores**: lowest prices for newborn and pregnancy items in your city, shared by moms.
- **Community**: a safe space to ask and share.
- **AI assistant**: a chat in the bottom right corner that answers questions.

## Run
1. Open `index.html` to try everything except the AI assistant.
2. For the assistant, deploy to Vercel (import the repo) and add the environment variable `ANTHROPIC_API_KEY`. Optional: `ANTHROPIC_MODEL`.

## Structure
```
index.html     the whole frontend
api/chat.js    serverless function for the AI assistant (keeps the key secret)
```

## Data
Listings, posts and prices are stored in `localStorage` through the `DB` object at the top of the script. Replace `DB` with Supabase or Firebase calls to share data between users. Sample listings, posts and prices are demo data.
