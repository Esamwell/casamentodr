"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, X, Image as ImageIcon, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Midia = {
  id: string;
  tipo: "foto" | "video";
  url: string;
  nome_convidado: string | null;
  mensagem: string | null;
  criado_em: string;
};

export default function GaleriaPage() {
  const [midias, setMidias] = useState<Midia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMidia, setSelectedMidia] = useState<Midia | null>(null);

  const fetchMidias = async () => {
    try {
      const { data, error } = await supabase
        .from("midias")
        .select("*")
        .order("criado_em", { ascending: false });

      if (error) throw error;
      if (data) setMidias(data as Midia[]);
    } catch (error) {
      console.error("Erro ao buscar mídias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMidias();

    // Inscrição no realtime para novas fotos
    const channel = supabase
      .channel("midias-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "midias" },
        (payload) => {
          setMidias((prev) => [payload.new as Midia, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background flex flex-col pb-20 pt-6 px-4">
      {/* Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between mb-8">
        <Link href="/" className="p-2 -ml-2 text-foreground/60 hover:text-foreground">
          <ArrowLeft className="size-6" />
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-serif font-semibold text-primary">Nossa Galeria</h1>
          <p className="text-sm font-sans text-foreground/60">{midias.length} {midias.length === 1 ? 'momento salvo' : 'momentos salvos'}</p>
        </div>
        {/* Placeholder para manter o flex entre */}
        <div className="w-10"></div>
      </div>

      {/* Grid */}
      <div className="w-full max-w-5xl mx-auto">
        {isLoading ? (
          // Skeleton Loading (UX Feedback skill)
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-full bg-foreground/5 rounded-2xl animate-pulse"
                style={{ height: `${Math.floor(Math.random() * 150) + 150}px` }}
              />
            ))}
          </div>
        ) : midias.length === 0 ? (
          // Empty State (UX Feedback skill)
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="size-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-foreground/5">
              <ImageIcon className="size-8 text-primary/40" />
            </div>
            <h2 className="text-xl font-serif text-foreground/80 mb-2">Nenhuma lembrança ainda</h2>
            <p className="text-sm text-foreground/60 mb-6 max-w-xs leading-relaxed">
              As primeiras fotos do grande dia estão a caminho... seja você quem começa essa galeria!
            </p>
            <Link
              href="/enviar"
              className="bg-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md shadow-primary/20 transition-colors hover:bg-primary/90"
            >
              Enviar a primeira foto
            </Link>
          </div>
        ) : (
          // Masonry Grid
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            <AnimatePresence>
              {midias.map((midia) => (
                <motion.div
                  key={midia.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                  onClick={() => setSelectedMidia(midia)}
                  className="relative cursor-pointer rounded-xl overflow-hidden group bg-foreground/5 break-inside-avoid"
                >
                  {midia.tipo === "video" ? (
                    <>
                      <video
                        src={midia.url}
                        className="w-full h-auto object-cover pointer-events-none"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="bg-white/30 backdrop-blur-md p-3 rounded-full text-white">
                          <Play className="size-6 fill-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={midia.url}
                      alt="Momento do casamento"
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  
                  {/* Etiqueta de nome opcional */}
                  {midia.nome_convidado && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                      <p className="text-white text-xs font-medium truncate">{midia.nome_convidado}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox / Modal Modal */}
      <AnimatePresence>
        {selectedMidia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center p-4 z-10">
              <button
                onClick={() => setSelectedMidia(null)}
                className="p-2 text-white/70 hover:text-white bg-white/10 rounded-full backdrop-blur-md"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Media Content */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
              {selectedMidia.tipo === "video" ? (
                <video
                  src={selectedMidia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full rounded-lg outline-none"
                />
              ) : (
                <img
                  src={selectedMidia.url}
                  alt="Momento visualizado"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              )}
            </div>

            {/* Metadata Bottom */}
            {(selectedMidia.nome_convidado || selectedMidia.mensagem) && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-12 text-white"
              >
                <div className="max-w-2xl mx-auto">
                  {selectedMidia.nome_convidado && (
                    <p className="font-serif font-semibold text-xl text-primary-light mb-1">
                      {selectedMidia.nome_convidado}
                    </p>
                  )}
                  {selectedMidia.mensagem && (
                    <p className="text-white/80 font-sans leading-relaxed text-sm md:text-base italic">
                      "{selectedMidia.mensagem}"
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
