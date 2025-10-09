"use client";

import { Convidado } from "@/lib/types";
import { CheckIcon, LinkIcon } from "lucide-react";
import { useState } from "react";

interface ConvidadoItemProps {
  convidado: Convidado;
  eventoId: string;
}

export function ConvidadoItem({ eventoId, convidado: c }: ConvidadoItemProps) {
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