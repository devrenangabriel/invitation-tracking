"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Evento, Convidado } from "@/lib/types";
/**
 * Componente responsável por gerar e exportar o relatório completo de um evento.
 *
 * Este componente:
 * - Busca as informações de um evento específico no Firestore.
 * - Coleta todos os convidados e seus trajetos relacionados.
 * - Gera um arquivo Excel (.xlsx) contendo:
 *   1. Uma aba com informações gerais do evento.
 *   2. Uma aba detalhada onde **cada linha representa uma etapa (trajeto)**
 *      de um convidado, permitindo visualizar o histórico completo.
 * - Permite baixar o arquivo Excel através de um botão.
 *
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {string} props.eventoId - ID do evento no Firestore que será exportado.
 *
 * @example
 * <ExportarRelatorioEvento eventoId="123abc" />
 *
 * @returns {JSX.Element} Um botão que, ao ser clicado, gera e baixa o relatório.
 */
export default function ExportarRelatorioEvento({
  eventoId,
}: {
  eventoId: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      // 1️⃣ Buscar dados do evento
      const eventoRef = doc(db, "eventos", eventoId);
      const eventoSnap = await getDoc(eventoRef);
      if (!eventoSnap.exists()) {
        toast.error("Evento não encontrado");
        setLoading(false);
        return;
      }

      const evento = eventoSnap.data() as Evento;

      // 2️⃣ Buscar todos os convidados
      const convidadosRef = collection(db, "eventos", eventoId, "convidados");
      const convidadosSnap = await getDocs(convidadosRef);

      const convidados: Convidado[] = convidadosSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Convidado, "id">),
      }));

      // 3️⃣ Gerar linhas da planilha: 1 por trajeto
      const rows = convidados.flatMap((c) =>
        c.trajeto.map((t, index) => ({
          "ID Convidado": c.id,
          Nome: c.nome,
          CPF: c.cpf,
          Telefone: c.telefone,
          Título: c.titulo,
          Cidade: c.cidade,
          "Nº Voo": c.voo?.num_voo ?? "",
          "Cia Aérea": c.voo?.ciaAerea ?? "",
          "Data Saída": c.voo?.data_saida ?? "",
          "Hora Saída": c.voo?.hora_saida ?? "",
          "Data Chegada": c.voo?.data_chegada ?? "",
          "Hora Chegada": c.voo?.hora_chegada ?? "",
          "Lat Aeroporto": c.voo?.aeroporto_lat ?? "",
          "Log Aeroporto": c.voo?.aeroporto_log ?? "",
          Status: t.status,
          "Data Status": t.data,
          "Equipe de Campo": t.idEquipeDeCampo ?? "",
          "Previsão de Chegada": t.previsao_chegada ?? "",
          "Etapa nº": index + 1,
        }))
      );

      // 4️⃣ Informações gerais do evento (aba separada)
      const eventoInfo = [
        ["Nome do Evento", evento.nome],
        ["Local", evento.local],
        ["Data", evento.data.toDate().toLocaleDateString("pt-BR")],
        ["Latitude", evento.latitude],
        ["Longitude", evento.longitude],
        ["Total de Convidados", convidados.length],
      ];

      // 5️⃣ Criar workbook
      const wb = XLSX.utils.book_new();

      // Aba do evento
      const wsEvento = XLSX.utils.aoa_to_sheet(eventoInfo);
      XLSX.utils.book_append_sheet(wb, wsEvento, "Evento");

      // Aba de trajetos
      const wsConvidados = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, wsConvidados, "Convidados e Trajetos");

      // 6️⃣ Gerar arquivo
      const nomeArquivo = `Relatorio_${evento.nome.replace(/\s+/g, "_")}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);

      toast.success("📊 Relatório detalhado gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar relatório.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={loading}>
      {loading ? "Gerando..." : "📊 Baixar Relatório Completo"}
    </Button>
  );
}
