import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repas Garde — Planification de repas pour la garde d'enfants",
  description:
    "Planifie les repas de la semaine de garde d'enfants, fais valider par les parents avant l'épicerie, génère la liste d'épicerie et synchronise tout en temps réel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="light">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700&f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23C9572E'/%3E%3Cpath d='M10 13h12M10 18h8' stroke='white' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E" />
      </head>
      <body style={{ ["--font-body" as string]: "'General Sans', sans-serif", ["--font-display" as string]: "'Cabinet Grotesk', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
