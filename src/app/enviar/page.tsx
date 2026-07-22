"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function EnviarPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Validação de tamanho no front-end
      const validFiles = selectedFiles.filter(file => {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        const sizeMB = file.size / (1024 * 1024);
        
        if (isVideo && sizeMB > 50) return false;
        if (isImage && sizeMB > 15) return false;
        return true;
      });

      if (validFiles.length < selectedFiles.length) {
        alert("Alguns arquivos excederam o limite de tamanho (Fotos: 15MB, Vídeos: 50MB) e foram ignorados.");
      }

      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setState("uploading");
    setProgress(0);
    setErrorMessage("");

    try {
      let completedCount = 0;
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const isVideo = file.type.startsWith("video/");
        
        // 1. Upload pro Storage
        const { error: uploadError, data } = await supabase.storage
          .from("casamento-uploads")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Recupera URL pública
        const { data: { publicUrl } } = supabase.storage
          .from("casamento-uploads")
          .getPublicUrl(fileName);

        // 2. Insere no Banco de Dados
        const { error: dbError } = await supabase
          .from("midias")
          .insert({
            tipo: isVideo ? 'video' : 'foto',
            url: publicUrl,
            nome_convidado: nome || null,
            mensagem: mensagem || null
          });

        if (dbError) throw dbError;

        completedCount++;
        setProgress(Math.round((completedCount / files.length) * 100));
      }

      setState("success");
      setFiles([]);
      setNome("");
      setMensagem("");
      
    } catch (error: any) {
      console.error(error);
      setState("error");
      setErrorMessage(error.message || "Ocorreu um erro ao enviar.");
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center pb-20 pt-6 px-4">
      {/* Header */}
      <div className="w-full max-w-md flex items-center mb-8 relative">
        <Link href="/" className="p-2 -ml-2 text-foreground/60 hover:text-foreground absolute left-0">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-xl font-serif font-semibold text-primary w-full text-center">
          Enviar Momentos
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center mt-20 max-w-sm"
          >
            <div className="size-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="size-10 text-secondary" />
            </div>
            <h2 className="text-2xl font-serif text-primary mb-3">Recebemos com carinho!</h2>
            <p className="text-foreground/70 mb-8 leading-relaxed">
              Obrigado por guardar esse momento com a gente. Sua lembrança já faz parte da nossa galeria.
            </p>
            <button
              onClick={() => setState("idle")}
              className="bg-primary text-white py-3 px-6 rounded-xl font-semibold shadow-md shadow-primary/20 w-full mb-3 transition-colors hover:bg-primary/90"
            >
              Enviar mais fotos
            </button>
            <Link
              href="/galeria"
              className="text-primary font-medium p-3 block"
            >
              Ir para a galeria
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md flex flex-col gap-6"
          >
            {/* Infos Opcionais */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-foreground/5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Seu nome <span className="text-foreground/40 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como você se chama?"
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Mensagem <span className="text-foreground/40 font-normal">(Opcional)</span>
                  </label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Deixe um recado para os noivos..."
                    rows={3}
                    className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Input de Arquivos */}
            <div className="bg-white rounded-2xl p-5 shadow-card border border-foreground/5 flex flex-col gap-4">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                capture="environment" // Hint for mobile devices to open camera directly or offer it prominently
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={state === "uploading"}
                className="w-full border-2 border-dashed border-primary/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-primary/5 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                <UploadCloud className="size-8" />
                <div className="text-center">
                  <span className="font-semibold block mb-1">Toque para selecionar</span>
                  <span className="text-xs text-foreground/50">Fotos (até 15MB) • Vídeos (até 50MB)</span>
                </div>
              </button>

              {/* Lista de Preview */}
              {files.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-sm font-medium text-foreground/70 mb-1">Arquivos selecionados ({files.length})</span>
                  <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-2 hide-scrollbar">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-background rounded-lg p-2 border border-foreground/5">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="size-10 bg-primary/10 rounded flex items-center justify-center shrink-0">
                            <ImageIcon className="size-5 text-primary/60" />
                          </div>
                          <span className="text-sm truncate text-foreground/80">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          disabled={state === "uploading"}
                          className="p-2 text-foreground/40 hover:text-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ações e Feedback */}
            {state === "error" && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                {errorMessage}
              </div>
            )}

            <div className="mt-4">
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || state === "uploading"}
                className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-semibold shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {state === "uploading" ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Enviando... {progress}%
                  </>
                ) : (
                  "Confirmar Envio"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
