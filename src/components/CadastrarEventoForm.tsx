"use client";

import { useState } from "react";
import { addDoc, collection, Timestamp, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Convidado } from "@/lib/types";
import { parseGuestExcel } from "@/lib/parseGuestExcel";

export default function CadastrarEventoForm() {
  const [nome, setNome] = useState("");
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFile(file ?? null);

    if (file) {
      try {
        const parsed = await parseGuestExcel(file);
        setConvidados(parsed);
        toast.success(`✅ ${parsed.length} convidados prontos para importar`);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao ler arquivo de convidados");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar evento
      const eventoRef = await addDoc(collection(db, "eventos"), {
        nome,
        local,
        data: Timestamp.fromDate(new Date(data)),
        convidados: [], // mantemos vazio no doc principal
      });

      // 2. Adicionar convidados (se houver)
      if (convidados.length > 0) {
        for (const c of convidados) {
          await setDoc(doc(collection(eventoRef, "convidados"), c.id), c);
        }
        console.log("Convidados adicionados!");
      }

      toast.success("🎉 Evento e convidados cadastrados com sucesso!");

      // reset
      setNome("");
      setLocal("");
      setData("");
      setFile(null);
      setConvidados([]);
    } catch (error) {
      console.error("Erro ao cadastrar evento:", error);
      toast.error("❌ Erro ao cadastrar evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome, Local e Data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Evento</Label>
          <Input
            id="nome"
            placeholder="Ex: Evento X"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="local">Local</Label>
          <Input
            id="local"
            placeholder="Ex: Auditório Central"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Upload convidados */}
      <div className="space-y-2">
        <Label htmlFor="file">Importar Convidados (opcional)</Label>
        <Card
          className="border-dashed cursor-pointer hover:bg-muted/40 transition"
          onClick={() => document.getElementById("file")?.click()}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              Clique aqui para selecionar um arquivo .xlsx
            </p>
            {convidados.length > 0 && (
              <p className="text-sm font-medium text-foreground">
                {convidados.length} convidados carregados do arquivo
              </p>
            )}
          </CardContent>
        </Card>

        {/* input escondido */}
        <Input
          id="file"
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Botão */}
      <Button type="submit" disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar Evento"}
      </Button>
    </form>
  );
}
