# fb-viewapp QR Generator

A one-page site: paste a URL, hit the button, get a QR code image encoding
`fb-viewapp://<your-url>` — the deeplink that opens a URL in the Facebook
in-app browser.

Scanning the code sends the device to `fb-viewapp://https://example.com/page`.
If the pasted text already starts with `fb-viewapp://`, it is not prepended twice.

## Local development

```bash
npm install
npm run dev     # http://localhost:3000
```

## Deploy to Vercel

Nothing to configure — no env vars, no backend. The QR code is generated in the
browser with [`qrcode`](https://www.npmjs.com/package/qrcode).

```bash
npx vercel          # preview deploy
npx vercel --prod   # production deploy
```

Or push the repo to GitHub and import it at
[vercel.com/new](https://vercel.com/new); Vercel auto-detects Next.js.

## Stack

- Next.js 15 (App Router), React 19
- `qrcode` for client-side PNG data-URL generation
