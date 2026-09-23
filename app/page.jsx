"use client";

import { useState } from "react";
import QRCode from "qrcode";

const SCHEME = "fb-viewapp://";

function buildDeeplink(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Don't double-prepend if the user already pasted a full deeplink.
  if (trimmed.toLowerCase().startsWith(SCHEME)) return trimmed;
  return SCHEME + trimmed;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [deeplink, setDeeplink] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate(event) {
    event.preventDefault();
    setError("");
    setCopied(false);

    const link = buildDeeplink(url);
    if (!link) {
      setImage("");
      setDeeplink("");
      setError("Paste a URL first.");
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(link, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      setDeeplink(link);
      setImage(dataUrl);
    } catch (err) {
      setImage("");
      setDeeplink("");
      setError(`Could not generate a QR code: ${err.message}`);
    }
  }

  async function copyDeeplink() {
    try {
      await navigator.clipboard.writeText(deeplink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Clipboard is unavailable in this browser.");
    }
  }

  return (
    <main className="page">
      <div className="card">
        <h1>fb-viewapp QR Generator</h1>
        <p className="subtitle">
          Paste a URL and get a QR code for <code>{SCHEME}</code> + your URL.
        </p>

        <form onSubmit={generate}>
          <label htmlFor="url">URL</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button type="submit">Generate QR code</button>
        </form>

        {error && <p className="error">{error}</p>}

        {image && (
          <div className="result">
            <img src={image} alt={`QR code for ${deeplink}`} />
            <p className="deeplink">{deeplink}</p>
            <div className="actions">
              <a href={image} download="fb-viewapp-qr.png">
                Download PNG
              </a>
              <button type="button" onClick={copyDeeplink}>
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
