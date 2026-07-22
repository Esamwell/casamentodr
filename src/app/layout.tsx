import type { Metadata } from "next";
import { Playfair_Display, Great_Vibes, Manrope } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Casamento Desirée & Reinaldo",
  description: "Compartilhe conosco os momentos do nosso grande dia!",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${greatVibes.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
        
        {/* Background Elegante (Design Spell) */}
        <div className="fixed inset-0 z-0 pointer-events-none select-none flex">
          {/* Imagem dos noivos */}
          <img 
            src="/casamentodr.jpg" 
            alt="Fundo Noivos" 
            className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply"
          />
          
          {/* Vignette: Degradê radial para suavizar as bordas */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#F5EFE7_90%)]" />
        </div>

        {/* Conteúdo do site acima do fundo */}
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
