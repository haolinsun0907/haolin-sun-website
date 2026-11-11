import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// After deploying, replace with your real URL (e.g. https://haolinsun.vercel.app)
const siteUrl = "https://haolinsun.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Haolin Sun · AI Engineer",
  description:
    "AI engineer building LLM agents in production. Gemini/ADK contact-discovery agent: right-party contact 25% → 62% at ~$0.10 per account.",
  openGraph: {
    title: "Haolin Sun · AI Engineer",
    description: "LLM agents in production, RAG, and deep reinforcement learning research.",
    url: siteUrl,
    siteName: "Haolin Sun",
    type: "website",
  },
};

// Runs before first paint. The "motion" class lets CSS hide elements that
// will animate in. If the page's JavaScript hasn't started after 4 seconds,
// the class is removed again so nothing stays hidden.
const motionScript = `(function(){var d=document.documentElement;d.classList.add("motion");setTimeout(function(){if(!d.classList.contains("motion-ready"))d.classList.remove("motion")},4000)})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
