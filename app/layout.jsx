import "./globals.css";

export const metadata = {
  title: "fb-viewapp QR Generator",
  description: "Turn a URL into an fb-viewapp:// QR code image.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
