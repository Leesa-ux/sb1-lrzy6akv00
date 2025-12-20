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

        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://afroe.com/#localbusiness",
              name: "Afroé",
              description:
                "Plateforme beauté-tech qui connecte les meilleurs professionnels de la beauté Afro avec des clients en Belgique et en Europe. Services à domicile : coiffure afro, maquillage, barbe, soins, ongles.",
              url: "https://afroe.com",
              logo: "https://afroe.com/images/afroe-logo.jpg",
              image: "https://afroe.com/images/afroe-logo.jpg",
              priceRange: "€€",
              areaServed: [
                {
                  "@type": "Country",
                  name: "Belgium",
                },
                {
                  "@type": "Country",
                  name: "France",
                },
              ],
              serviceType: [
                "Coiffure Afro",
                "Maquillage",
                "Soins de la barbe",
                "Esthétique",
                "Manucure et pédicure",
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Services de beauté Afro",
                itemListElement: [
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Coiffure Afro à domicile",
                      description:
                        "Services de coiffure professionnelle pour cheveux afro et texturés, réalisés à domicile par des experts.",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Maquillage professionnel",
                      description:
                        "Services de maquillage adaptés aux peaux noires et métisses, à domicile.",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Soins de la barbe",
                      description:
                        "Taille, entretien et soins de la barbe par des barbiers professionnels.",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Soins esthétiques",
                      description:
                        "Soins du visage et du corps adaptés aux peaux noires et métisses.",
                    },
                  },
                  {
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: "Manucure et pédicure",
                      description: "Services de soins des ongles à domicile.",
                    },
                  },
                ],
              },
            }),
          }}
        />

        {/* FAQPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Où trouver un coiffeur afro en Belgique ?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Afroé est la plateforme beauté-tech qui connecte les meilleurs coiffeurs afro en Belgique avec des clients. Nos professionnels se déplacent à domicile pour offrir des services de coiffure afro premium adaptés à tous les types de cheveux texturés. Inscrivez-vous sur notre liste d'attente pour être parmi les premiers à réserver.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Quels services afro sont disponibles à domicile ?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Afroé propose une gamme complète de services beauté afro à domicile : coiffure afro (tresses, locks, défrisage, soins capillaires), maquillage professionnel adapté aux peaux noires et métisses, soins de la barbe, soins esthétiques du visage et du corps, ainsi que manucure et pédicure. Tous nos professionnels sont qualifiés et spécialisés dans la beauté afro-européenne.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Comment participer à la communauté Afro en Belgique ?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Rejoignez la communauté Afroé en vous inscrivant sur notre liste d'attente. Vous pourrez participer à des événements beauté exclusifs, découvrir les meilleurs professionnels de beauté afro en Belgique, et bénéficier d'un programme de parrainage avec des récompenses. Afroé valorise et célèbre la diversité de la beauté afro-européenne tout en créant un réseau professionnel et communautaire fort.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Pourquoi choisir Afroé pour mes besoins en beauté afro ?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Afroé est la première plateforme beauté-tech spécialisée en beauté afro en Europe. Nous garantissons des professionnels qualifiés qui comprennent les spécificités des cheveux et peaux afro, des services premium à domicile pour votre confort, une approche éco-responsable, et un engagement fort envers la communauté afro-européenne. Réservez facilement en ligne et profitez d'une expérience beauté exceptionnelle.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Comment devenir professionnel partenaire sur Afroé ?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Si vous êtes coiffeur, maquilleur, barbier, esthéticien ou spécialiste des ongles avec une expertise en beauté afro, vous pouvez rejoindre la communauté Afroé. Inscrivez-vous sur notre plateforme pour valoriser votre talent, gérer votre planning en toute autonomie, et développer votre clientèle. Afroé vous offre les outils pour réussir en tant que professionnel indépendant.",
                  },
                },
              ],
            }),
          }}
        />

        {/* Event Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "@id": "https://afroe.com/#launch-event",
              name: "Lancement officiel d'Afroé - Plateforme beauté-tech afro-européenne",
              description:
                "Rejoignez-nous pour le lancement de la première plateforme beauté-tech dédiée à la communauté afro-européenne. Découvrez nos services, rencontrez des professionnels de la beauté afro, et participez à des démonstrations exclusives.",
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
              location: {
                "@type": "VirtualLocation",
                url: "https://afroe.com",
              },
              organizer: {
                "@type": "Organization",
                name: "Afroé",
                url: "https://afroe.com",
              },
              offers: {
                "@type": "Offer",
                url: "https://afroe.com/waitlist",
                price: "0",
                priceCurrency: "EUR",
                availability: "https://schema.org/InStock",
                validFrom: "2024-01-01",
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
