"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { DownloadCloud, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Midia = {
  id: string;
  tipo: "foto" | "video";
  url: string;
  nome_convidado: string | null;
  mensagem: string | null;
  criado_em: string;
};

function AdminContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    const chave = searchParams.get("chave");
    if (chave === "casamento2026") {
      setIsAuthenticated(true);
    }
  }, [searchParams]);

  const downloadAll = async () => {
    setIsDownloading(true);
    setProgress(0);
    setStatusText("Buscando lista de arquivos...");

    try {
      const { data, error } = await supabase
        .from("midias")
        .select("*")
        .order("criado_em", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        alert("Nenhum arquivo encontrado para baixar.");
        setIsDownloading(false);
        return;
      }

      setStatusText("Criando arquivo ZIP e organizando mensagens...");
      const zip = new JSZip();
      const midias = data as Midia[];
      
      // Cria o PDF
      const doc = new jsPDF();
      doc.setFont("helvetica");
      doc.setFontSize(22);
      doc.text("Mensagens dos Convidados", 20, 20);
      doc.setFontSize(12);
      
      let cursorY = 35;
      const margin = 20;
      const pageHeight = doc.internal.pageSize.height;

      let count = 0;
      for (const midia of midias) {
        // --- ADICIONA NO PDF ---
        if (midia.mensagem && midia.mensagem.trim() !== "") {
          const nomeStr = midia.nome_convidado ? midia.nome_convidado : "Alguém";
          const dataStr = new Date(midia.criado_em).toLocaleDateString("pt-BR");
          const title = `${nomeStr} (${dataStr}):`;
          
          doc.setFont("helvetica", "bold");
          
          // Checa se precisa quebrar a página antes do titulo
          if (cursorY + 10 > pageHeight - margin) {
            doc.addPage();
            cursorY = 20;
          }
          
          doc.text(title, margin, cursorY);
          cursorY += 7;
          
          doc.setFont("helvetica", "normal");
          
          // Quebra texto longo
          const lines = doc.splitTextToSize(`"${midia.mensagem}"`, 170);
          
          // Checa se as linhas cabem
          if (cursorY + (lines.length * 6) > pageHeight - margin) {
            doc.addPage();
            cursorY = 20;
          }
          
          doc.text(lines, margin, cursorY);
          cursorY += (lines.length * 6) + 10;
        }

        // --- BAIXA ARQUIVO DE MÍDIA ---
        try {
          setStatusText(`Baixando arquivo ${count + 1} de ${midias.length}...`);
          
          const response = await fetch(midia.url);
          const blob = await response.blob();
          
          const date = new Date(midia.criado_em).getTime();
          const guestName = midia.nome_convidado ? midia.nome_convidado.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'anonimo';
          const ext = midia.tipo === 'video' ? 'mp4' : 'jpg'; 
          
          const urlExt = midia.url.split('.').pop()?.split('?')[0];
          const finalExt = urlExt && urlExt.length <= 4 ? urlExt : ext;

          const filename = `${guestName}_${date}.${finalExt}`;
          
          zip.file(filename, blob);
          count++;
          setProgress(Math.round((count / midias.length) * 100));
        } catch (err) {
          console.error("Erro ao baixar arquivo", midia.url, err);
        }
      }

      // Adiciona o PDF ao ZIP
      setStatusText("Gerando PDF com as mensagens...");
      const pdfBlob = doc.output('blob');
      zip.file("0_Mensagens_Convidados.pdf", pdfBlob);

      setStatusText("Compactando arquivos (isso pode demorar)...");
      const content = await zip.generateAsync({ type: "blob" });
      
      saveAs(content, "Fotos_Casamento_Desiree_e_Reinaldo.zip");
      setStatusText("Download concluído!");
      
    } catch (err) {
      console.error(err);
      setStatusText("Ocorreu um erro ao gerar o arquivo.");
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="size-12 text-primary mb-4" />
        <h1 className="text-2xl font-serif text-primary mb-2">Acesso Restrito</h1>
        <p className="text-foreground/70 mb-4">Você não tem permissão para acessar esta página.</p>
        <Link href="/" className="text-primary underline">Voltar para o início</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="absolute top-6 left-6">
        <Link href="/" className="p-2 text-foreground/60 hover:text-foreground inline-block">
          <ArrowLeft className="size-6" />
        </Link>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl flex flex-col items-center max-w-md w-full text-center border border-foreground/5">
        <div className="bg-primary/10 p-4 rounded-full mb-6">
          <DownloadCloud className="size-10 text-primary" />
        </div>
        
        <h1 className="font-serif text-3xl text-primary mb-2">Painel dos Noivos</h1>
        <p className="text-foreground/70 font-sans mb-8 leading-relaxed">
          Clique abaixo para baixar todas as fotos e vídeos enviados pelos convidados em um único arquivo ZIP.
        </p>

        <button
          onClick={downloadAll}
          disabled={isDownloading}
          className="w-full bg-primary text-white py-4 px-6 rounded-xl font-semibold shadow-md transition-all hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {progress}%
            </>
          ) : (
            "Baixar Galeria Completa"
          )}
        </button>

        {isDownloading && (
          <p className="mt-4 text-sm font-medium text-primary animate-pulse">
            {statusText}
          </p>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <AdminContent />
    </Suspense>
  );
}
