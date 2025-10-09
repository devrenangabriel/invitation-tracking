"use client";

import { Convidado } from "@/lib/types";
import { CheckIcon, LinkIcon } from "lucide-react";
import { useState } from "react";

interface ConvidadoItemProps {
  /** 
   * Objeto contendo os dados do convidado.
   * Inclui informações como nome, telefone, título e, opcionalmente, dados de voo.
   */
  convidado: Convidado;

  /**
   * Identificador único do evento ao qual o convidado pertence.
   * Utilizado para compor o link personalizado (Magic Link).
   */
  eventoId: string;
}

/**
 * Componente responsável por exibir as informações resumidas de um convidado,
 * incluindo nome, telefone, título e dados de voo, além de permitir copiar o "Magic Link"
 * — um link direto para a página do convidado no evento.
 *
 * Funcionalidades:
 * - Renderiza os dados principais do convidado.
 * - Exibe um botão que copia o link completo do convidado para a área de transferência.
 * - Mostra feedback visual ("Copiado!") após a ação de cópia.
 *
 * @component
 * @param {ConvidadoItemProps} props - Propriedades contendo o convidado e o evento associado.
 * @returns {JSX.Element} Um item de lista representando o convidado, com botão de copiar link.
 */
export function ConvidadoItem({ eventoId, convidado: c }: ConvidadoItemProps) {
  /**
   * Estado que guarda o ID do convidado cujo link foi copiado recentemente.
   * Utilizado para exibir feedback visual temporário ("Copiado!").
   */
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /**
   * Copia o link do convidado para a área de transferência.
   * 
   * Monta o link com base na origem da janela (`window.location.origin`),
   * no ID do convidado e no ID do evento, e copia-o usando a API `navigator.clipboard`.
   * Após copiar, exibe a mensagem "Copiado!" por 2 segundos.
   *
   * @param {string} convidadoId - ID do convidado cujo link será copiado.
   */
  const handleCopyLink = (convidadoId: string) => {
    const link = `${window.location.origin}/convidado/${convidadoId}?eventoId=${eventoId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(convidadoId);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <li
      key={c.id}
      className="border rounded-lg p-4 shadow-sm hover:bg-gray-50 transition"
    >
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
            ✈️ Voo {c.voo.num_voo} — {c.voo.data_saida} {c.voo.hora_saida}
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
  );
}
