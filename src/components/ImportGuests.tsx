"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Convidado } from "@/lib/types";
import { parseGuestExcel } from "@/lib/parseGuestExcel";

/**
@summary Componente de cliente para importação de convidados via Excel.
@description Renderiza uma interface de upload de arquivo (.xlsx).
Utiliza a função parseGuestExcel para ler o arquivo selecionado,
armazena os convidados em um estado local e exibe uma pré-visualização
dos primeiros 5 convidados importados.*
@returns {JSX.Element} O componente de UI para importação de convidados.
*/

export default function ImportGuests() {
  const [file, setFile] = useState<File | null>(null);
  const [convidados, setConvidados] = useState<Convidado[]>([]);

  const handleImport = async () => {
    if (!file) {
      toast.error("Selecione um arquivo .xlsx");
      return;
    }

    try {
      const result = await parseGuestExcel(file);
      setConvidados(result);
      toast.success(`✅ ${result.length} convidados importados`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao importar convidados");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardContent className="p-6 flex flex-col gap-4">
          <Input
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button onClick={handleImport}>Importar Convidados</Button>
        </CardContent>
      </Card>

      {convidados.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Pré-visualização</h3>
          <ul className="text-sm list-disc list-inside">
            {convidados.slice(0, 5).map((c) => (
              <li key={c.id}>
                {c.nome} - {c.telefone} ({c.cidade})
              </li>
            ))}
          </ul>
          {convidados.length > 5 && (
            <p className="text-xs text-muted-foreground">
              ...e mais {convidados.length - 5} convidados
            </p>
          )}
        </div>
      )}
    </div>
  );
}
