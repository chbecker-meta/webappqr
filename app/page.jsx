"use client";

import { useState } from "react";
import QRCode from "qrcode";

const SCHEME = "fb-viewapp://";
const HOST = "web_app_deep_link";

// The deeplink carries the full target URL percent-encoded in an appUrl param:
// fb-viewapp://web_app_deep_link?appName=todo&appUrl=https%3A%2F%2Fexample.com%2Ftodo%2F
function withProtocol(raw) {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

// Best guess: last path segment ("/todo/" -> "todo"), else the first
// hostname label ("chess-webmcp.vercel.app" -> "chess-webmcp").
function guessAppName(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(withProtocol(trimmed));
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length) return segments[segments.length - 1];
    return parsed.hostname.split(".")[0];
  } catch {
    return "";
  }
}

function buildDeeplink(rawUrl, rawName) {
  const trimmed = rawUrl.trim();
  if (!trimmed) throw new Error("Paste a URL first.");

  // Already a full deeplink? Pass it through untouched.
  if (trimmed.toLowerCase().startsWith(SCHEME)) return trimmed;

  const target = withProtocol(trimmed);
  try {
    new URL(target);
  } catch {
    throw new Error(`"${trimmed}" is not a valid URL.`);
  }

  const name = rawName.trim();
  const params = [];
  if (name) params.push(`appName=${encodeURIComponent(name)}`);
  params.push(`appUrl=${encodeURIComponent(target)}`);

  return `${SCHEME}${HOST}?${params.join("&")}`;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [appName, setAppName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [deeplink, setDeeplink] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Keep the name in sync with the URL until the user edits it themselves.
  function onUrlChange(value) {
    setUrl(value);
    if (!nameTouched) setAppName(guessAppName(value));
  }

  function onNameChange(value) {
    setNameTouched(true);
    setAppName(value);
  }

  function reset() {
    setImage("");
    setDeeplink("");
  }

  async function generate(event) {
    event.preventDefault();
    setError("");
    setCopied(false);

    let link;
    try {
      link = buildDeeplink(url, appName);
    } catch (err) {
      reset();
      setError(err.message);
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
      reset();
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
          Paste a URL to get a QR code for its <code>{SCHEME}</code> web app
          deeplink.
        </p>

        <form onSubmit={generate}>
          <label htmlFor="url">URL</label>
          <input
            id="url"
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/todo/"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          <label htmlFor="appName">App name</label>
          <input
            id="appName"
            type="text"
            value={appName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="optional"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <p className="hint">
            Guessed from the URL. Edit it, or clear it to leave{" "}
            <code>appName</code> out of the deeplink.
          </p>

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
