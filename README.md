# fb-viewapp QR Generator

A one-page site: paste a URL, hit the button, get a QR code image encoding the
`fb-viewapp://` web app deeplink that opens it in the Facebook in-app browser.

## Deeplink format

```
fb-viewapp://web_app_deep_link?appName=todo&appUrl=https%3A%2F%2Fexample.com%2Ftodo%2F
```

The target URL keeps its protocol and is percent-encoded into `appUrl`. A URL
pasted without a protocol gets `https://` added before encoding.

### App name

`appName` is prefilled with a best guess and stays in sync with the URL field
until you edit it:

| URL | Guessed `appName` |
| --- | --- |
| `https://example.com/todo/` | `todo` — last path segment |
| `https://example.com/a/b/` | `b` — last path segment |
| `https://chess-webmcp.vercel.app/` | `chess-webmcp` — first hostname label, since there's no path |

Clear the field and `appName` is omitted from the deeplink entirely.

Text that already starts with `fb-viewapp://` is passed straight through, so you
can paste a finished deeplink to get just the QR code.

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
