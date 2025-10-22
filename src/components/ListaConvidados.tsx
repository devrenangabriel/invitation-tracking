"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { TrajetoStatus, type Convidado } from "@/lib/types";
import { ConvidadoItem } from "./ConvidadoItem";

/**
 * Renderiza uma lista interativa de convidados para um evento específico.
 *
 * Este é um Componente de Cliente (`'use client'`) que exibe os detalhes de cada
 * convidado em um card. Para cada card, ele gera um "magic link" único e fornece
 * um botão para copiá-lo para a área de transferência, exibindo um feedback
 * visual temporário de sucesso.
 *
 * @param props - As propriedades do componente.
 * @param props.eventoId - O ID do evento, usado para construir o "magic link" de cada convidado.
 * @returns Um elemento JSX que renderiza a lista de convidados.
 */
export default function ListaConvidados({ eventoId }: { eventoId: string }) {
  const [convidados, setConvidados] = useState<Convidado[]>([]);

  useEffect(() => {
    const ref = collection(db, "eventos", eventoId, "convidados");

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const novosConvidados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Convidado, "id">),
      }));
      setConvidados(novosConvidados);
    });

    return () => unsubscribe();
  }, [eventoId]);

  return (
    <div>
      {convidados.length === 0 ? (
        <p className="text-gray-500">Nenhum convidado importado ainda.</p>
      ) : (
        <ul className="grid grid-cols-6 gap-2">
          <div className="space-y-2">
            <p>PENDENTE</p>
            {convidados
              .filter(
                (c) =>
                  c.trajeto[c.trajeto.length - 1].status ===
                  TrajetoStatus.PENDENTE
              )
              .map((c) => (
                <ConvidadoItem key={c.id} convidado={c} eventoId={eventoId} />
              ))}
          </div>

          <div className="space-y-2">
            <p>CONFIRMADO</p>
            {convidados
              .filter(
                (c) =>
                  c.trajeto[c.trajeto.length - 1].status ===
                  TrajetoStatus.CONFIRMADO
              )
              .map((c) => (
                <ConvidadoItem key={c.id} convidado={c} eventoId={eventoId} />
              ))}
          </div>

          <div className="space-y-2">
            <p>NO VOO</p>
            {convidados
              .filter(
                (c) =>
                  c.trajeto[c.trajeto.length - 1].status ===
                  TrajetoStatus.NO_VOO
              )
              .map((c) => (
                <ConvidadoItem key={c.id} convidado={c} eventoId={eventoId} />
              ))}
          </div>

          <div className="space-y-2">
            <p>COM A EQUIPE</p>
            {convidados
              .filter(
                (c) =>
                  c.trajeto[c.trajeto.length - 1].status ===
                  TrajetoStatus.COM_EQUIPE
              )
              .map((c) => (
                <ConvidadoItem key={c.id} convidado={c} eventoId={eventoId} />
              ))}
          </div>

          <div className="space-y-2">
            <p>COM O MOTORISTA</p>
            {convidados
              .filter(
                (c) =>
                  c.trajeto[c.trajeto.length - 1].status ===
                  TrajetoStatus.COM_MOTORISTA
              )
              .map((c) => (
                <ConvidadoItem key={c.id} convidado={c} eventoId={eventoId} />
              ))}
          </div>

          <div className="space-y-2">
            <p>FINALIZADO</p>
            {convidados
              .filter(
                (c) =>
                  c.trajeto[c.trajeto.length - 1].status ===
                  TrajetoStatus.FINALIZADO
              )
              .map((c) => (
                <ConvidadoItem key={c.id} convidado={c} eventoId={eventoId} />
              ))}
          </div>
        </ul>
      )}
    </div>
  );
}
