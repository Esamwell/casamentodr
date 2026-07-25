"use client";

import Link from "next/link";
import { Camera, Image as ImageIcon, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos florais/boho decorativos (Círculos difusos no fundo) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/15 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        <div className="mb-4">
          <Heart className="size-6 text-primary mb-2 mx-auto stroke-[1.5]" />
          <h2 className="text-sm font-sans tracking-widest uppercase text-foreground/70 mb-1">
            Com muita alegria, celebramos
          </h2>
        </div>

        <h1 className="font-script text-6xl md:text-7xl text-primary mb-4 leading-tight">
          Desirée & Reinaldo
        </h1>

        <p className="font-serif text-lg md:text-xl text-foreground mb-8 italic">
          Sábado, 25 de julho de 2026
        </p>

        <p className="text-base text-foreground/80 mb-10 font-sans leading-relaxed px-2">
          Registre com a gente os momentos mais especiais desse dia. Toda foto e
          vídeo que você enviar aqui vai fazer parte da nossa memória para
          sempre.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/enviar"
              className="flex items-center justify-center gap-2 w-full bg-primary text-white py-4 px-6 rounded-2xl shadow-lg shadow-primary/25 font-semibold text-lg transition-colors hover:bg-primary/90"
            >
              <Camera className="size-5" />
              Enviar minha foto/vídeo
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/galeria"
              className="flex items-center justify-center gap-2 w-full bg-white text-primary border border-primary/20 py-4 px-6 rounded-2xl shadow-sm font-semibold text-lg transition-colors hover:bg-primary/5"
            >
              <ImageIcon className="size-5" />
              Ver galeria do casamento
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
