import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ErrorBoundary from "../components/ui/error-boundary"; // ✅ use relative path (works everywhere)

// Load Google Font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

// ✅ LLM-READY METADATA (SEO + OpenGraph + AI context)
export const metadata: Metadata = {
  title: "Afroé – Beauty-Tech Afro-Européenne | Ton style, ton impact, ton futur",
  description:
    "Afroé est une plateforme beauté-tech afro-européenne qui connecte clients et pros Afro à domicile. Réserve coiffure, maquillage, barbe, soins et ongles avec des experts qui respectent ta texture, ton temps et ta planète.",
  keywords: [
    "Afroé",
    "beauté afro",
    "beauty-tech",
    "plateforme beauté Afro européenne",
    "Afro hair",
    "coiffure afro à domicile",
    "makeup afro",
    "barbe afro",
    "esthéticienne afro",
    "pro beauté afro",
    "app beauté afro",
    "réservation beauté en ligne",
    "eco-beauty Afro",
    "Afro beauty tech Europe",
  ],
  openGraph: {
    title: "Afroé – L'app beauté Afro-européenne nouvelle génération",
    description:
      "Afroé relie les meilleurs pros beauté Afro aux clients modernes. Services premium, écologiques et à domicile.",
    url: "https://afroe.com",
    siteName: "Afroé",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/afroe-og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Afroé – Plateforme beauté-tech Afro européenne",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Afroé – La beauté Afro connectée et premium",
    description:
      "Découvre Afroé, la beauty-tech Afro-européenne qui valorise les pros beauté et sublime la diversité.",
    images: ["/images/afroe-og-banner.jpg"],
    creator: "@afroeofficial",
  },
  robots: {
    index: true,
    follow: true,
  },
  // 👇 Custom fields for AI crawlers & LLM-based search (SGE, ChatGPT, Perplexity)
  other: {
    "ai-topic":
      "beauty-tech platform connecting Afro-European beauty professionals and clients",
    "ai-brand": "Afroé",
    "ai-intent":
      "help users find and book Afro beauty services easily while empowering independent Afro beauty professionals in Europe",
  },
};

// ✅ Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://api.brevo.com" />
        <link rel="dns-prefetch" href="https://api.twilio.com" />

        {/* ✅ JSON-LD structured data for LLMs and Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Afroé",
              url: "https://afroe.com",
              logo: "https://afroe.com/images/afroe-logo.jpg",
              sameAs: [
                "https://www.instagram.com/afroeofficial",
                "https://www.linkedin.com/company/afroe",
              ],
              description:
                "Afroé est une plateforme beauté-tech afro-européenne qui connecte clients et professionnels de la beauté Afro à domicile.",
              founder: {
                "@type": "Person",
                name: "Lisa M.",
                gender: "Female",
              },
              areaServed: ["Belgium", "France", "Europe"],
              brand: {
                "@type": "Brand",
                name: "Afroé",
                slogan: "Ton style, ton impact, ton futur",
              },
              offers: {
                "@type": "Service",
                name: "Réservation beauté Afro à domicile",
                serviceType:
                  "Afro hair, maquillage, barbe, soins, ongles à domicile",
                providerType: "Beauty Professional",
              },
              potentialAction: {
                "@type": "RegisterAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://afroe.com/waitlist",
                },
                result: {
                  "@type": "Thing",
                  name: "Waitlist Afroé",
                },
              },
            }),
          }}
        />
      </head>

      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
