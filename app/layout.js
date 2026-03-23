import "./globals.css";

export const metadata = {
  title: "Buchwald Treatment Plan",
  description: "Treatment Plan Generator - Buchwald Family Dentistry",
  manifest: "/manifest.json",
  themeColor: "#0098D4",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Treatment Plan" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
