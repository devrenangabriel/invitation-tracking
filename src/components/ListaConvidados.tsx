"use client";

import { useState } from "react";
import type { Convidado } from "@/lib/types"; // Importe seu tipo Convidado
import { CheckIcon, LinkIcon } from "lucide-react";

/**
 * Renderiza uma lista interativa de convidados para um evento específico.
 *
 * Este é um Componente de Cliente (`'use client'`) que exibe os detalhes de cada
 * convidado em um card. Para cada card, ele gera um "magic link" único e fornece
 * um botão para copiá-lo para a área de transferência, exibindo um feedback
 * visual temporário de sucesso.
 *
 * @param props - As propriedades do componente.
 * @param props.convidados - Um array de objetos `Convidado` a serem exibidos.
 * @param props.eventoId - O ID do evento, usado para construir o "magic link" de cada convidado.
 * @returns Um elemento JSX que renderiza a lista de convidados.
 */
export default function ListaConvidados({
  convidados,
  eventoId,
}: {
  convidados: Convidado[];
  eventoId: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (convidadoId: string) => {
    // Monta a URL completa para ser copiada
    const link = `${window.location.origin}/convidado/${convidadoId}?eventoId=${eventoId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(convidadoId); // Ativa o feedback visual "Copiado!"

    // Reseta o feedback após 2 segundos
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div>
      {convidados.length === 0 ? (
        <p className="text-gray-500">Nenhum convidado importado ainda.</p>
      ) : (
        <ul className="space-y-4">
          {convidados.map((c) => (
            <li
              key={c.id}
              className="border rounded-lg p-4 shadow-sm hover:bg-gray-50 transition"
            >
              {/* Informações do convidado */}
              <div>
                <p className="font-semibold text-lg">{c.nome}</p>
                <p className="text-sm text-gray-600">
                  📞 {c.telefone || "Não informado"}
                </p>
                <p className="text-sm text-gray-600">
                  🎫 {c.titulo || "Não informado"}
                </p>
                {c.voo && (
                  <p className="text-sm text-gray-600">
                    ✈️ Voo {c.voo.num_voo} — {c.voo.data_saida}{" "}
                    {c.voo.hora_saida}
                  </p>
                )}
              </div>

              {/* Seção do Magic Link */}
              <div className="mt-4 pt-3 border-t flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Magic Link do Convidado
                  </span>
                </div>
                <button
                  onClick={() => handleCopyLink(c.id)}
                  className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full transition ${
                    copiedId === c.id
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {copiedId === c.id ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      Copiado!
                    </>
                  ) : (
                    "Copiar Link"
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
