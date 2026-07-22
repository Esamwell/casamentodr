"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

export default function QRCodePage() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Pega a URL atual e remove /qrcode para apontar para a home
    if (typeof window !== "undefined") {
      setUrl(window.location.origin);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 left-6 print:hidden">
        <Link href="/" className="p-2 text-foreground/60 hover:text-foreground inline-block">
          <ArrowLeft className="size-6" />
        </Link>
      </div>

      <div className="bg-white p-12 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full text-center border border-foreground/5">
        <h1 className="font-script text-5xl text-primary mb-2 print:text-black">
          Desirée & Reinaldo
        </h1>
        <p className="text-foreground/70 font-sans mb-8 print:text-black">
          Escaneie para compartilhar suas fotos e vídeos com os noivos.
        </p>

        <div className="bg-white p-4 rounded-xl shadow-inner border border-foreground/5 mb-8">
          {url ? (
            <QRCodeSVG
              value={url}
              size={250}
              level="H"
              fgColor="#3E2E22"
              bgColor="#ffffff"
            />
          ) : (
            <div className="w-[250px] h-[250px] bg-foreground/5 animate-pulse rounded-lg" />
          )}
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-white py-3 px-8 rounded-xl font-semibold shadow-md transition-colors hover:bg-primary/90 print:hidden"
        >
          <Printer className="size-5" />
          Imprimir QR Code
        </button>
      </div>
      
      {/* Estilos para impressão */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:text-black { color: black !important; }
        }
      `}} />
    </main>
  );
}
