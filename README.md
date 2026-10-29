# Shantel Kisi — Portfolio

A Next.js portfolio for Shantel Kisi, Computer Science MSc graduate, with project demonstrations and a fictional-data banking simulation.

## Run locally

Requires Node.js 20.9 or newer.

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Publish online

This project is configured for a standard Next.js host such as Vercel. To publish it:

1. Push the repository to a Git provider such as GitHub.
2. Import the repository into a Next.js hosting provider and deploy the `main` branch.
3. Add the final public origin as the `NEXT_PUBLIC_SITE_URL` environment variable, for example `https://portfolio.example.org` (without a trailing slash), then redeploy.
4. Add a custom domain in the hosting provider if desired.
5. Check the public home page, `/banking-demo`, `/robots.txt`, `/sitemap.xml`, and `/llms.txt`.

The site generates canonical/social metadata and an absolute sitemap from `NEXT_PUBLIC_SITE_URL`, or from Vercel's production URL when deployed there. It explicitly allows common AI crawlers in `robots.txt`; `/llms.txt` provides a concise text index of the portfolio. These files make the public content easier for compatible crawlers and LLM tools to discover, but do not guarantee indexing or visibility in any particular model.

## Media and repository size

The project walkthroughs are served from `public/` and need to be included in the deployed site. The Water Support card uses `public/water support app 2 Project.mp4`. Keep a high-quality source backup outside the repository and confirm your hosting provider's media and deployment limits before publishing.

## Public project notes

- The Water Support project is a prototype, not a connection to a water provider.
- The banking project is a browser-based portfolio simulation. It uses fictional records in the visitor's local browser and is not a real banking service.
- Add real GitHub, LinkedIn, and email links in `src/app/page.tsx` before sharing so employers have a way to reach you.
- A real CV download is not currently configured.

## Useful commands

```powershell
npm run build
npm run start
```
