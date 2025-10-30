"use client";

import React, { use, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import qrcode from "qrcode";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Convidado, Evento, TrajetoStatus } from "@/lib/types";

type ConvidadoPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ eventoId?: string }>;
};

export default function ConvidadoPage({
  params,
  searchParams,
}: ConvidadoPageProps) {
  // 🧩 Agora usamos React.use() para desempacotar os Promises
  const { id } = use(params);
  const { eventoId } = use(searchParams);

  const [convidado, setConvidado] = useState<Convidado | null>(null);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [botao, setBotao] = useState<"confirmar" | "voo" | "nenhum">("nenhum");

  useEffect(() => {
    if (!eventoId) return;

    const carregar = async () => {
      // 🔹 Buscar evento
      const eventoRef = doc(db, "eventos", eventoId);
      const eventoSnap = await getDoc(eventoRef);

      if (!eventoSnap.exists()) return;

      const eventoData = eventoSnap.data() as Omit<Evento, "id">;
      setEvento({ id: eventoSnap.id, ...eventoData });

      // 🔹 Buscar convidado
      const convidadoRef = doc(db, "eventos", eventoId, "convidados", id);
      const convidadoSnap = await getDoc(convidadoRef);

      if (!convidadoSnap.exists()) return;

      const convidadoData = convidadoSnap.data() as Omit<Convidado, "id">;
      setConvidado({ id: convidadoSnap.id, ...convidadoData });

      // 🔹 Gerar QR Code
      const qrData = JSON.stringify({ convidadoId: id, eventoId });
      const qr = await qrcode.toDataURL(qrData);
      setQrCode(qr);

      // 🔹 Determinar botão inicial
      const ultimoStatus =
        convidadoData.trajeto?.[convidadoData.trajeto.length - 1]?.status;

      if (ultimoStatus === TrajetoStatus.PENDENTE) setBotao("confirmar");
      else if (ultimoStatus === TrajetoStatus.CONFIRMADO) setBotao("voo");
      else setBotao("nenhum");

      setLoading(false);
    };

    carregar();
  }, [eventoId, id]);

  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </main>
    );

  if (!evento || !convidado)
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Convidado ou evento não encontrado.</p>
      </main>
    );

  // 🔹 Atualizar status no Firestore
  async function atualizarStatus(novoStatus: TrajetoStatus) {
    const convidadoRef = doc(db, "eventos", eventoId!, "convidados", id);

    const novoRegistro = {
      data: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      status: novoStatus,
      idEquipeDeCampo: null,
    };

    await updateDoc(convidadoRef, {
      trajeto: arrayUnion(novoRegistro),
    });

    setConvidado((prev) =>
      prev
        ? { ...prev, trajeto: [...(prev.trajeto || []), novoRegistro] }
        : prev
    );

    if (novoStatus === TrajetoStatus.CONFIRMADO) setBotao("voo");
    else if (novoStatus === TrajetoStatus.NO_VOO) setBotao("nenhum");
  }

  const dataEvento =
    evento.data instanceof Timestamp
      ? evento.data.toDate().toLocaleDateString("pt-BR")
      : "";

  return (
    <main className="flex items-start justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">
          Olá, {convidado.titulo} {convidado.nome}
        </h1>

        <div className="text-gray-600">
          Você foi convidado para o evento <strong>{evento.nome}</strong>.
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-bold text-gray-600">Local: {evento.local}</p>
          <p className="font-bold text-gray-600">Data: {dataEvento}</p>
          <p className="text-gray-500">Sua cidade: {convidado.cidade}</p>
        </div>

        {qrCode && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 text-center">
              Esse QR Code é sua credencial de acesso:
            </p>
            <img
              src={qrCode}
              alt="QR Code"
              className="w-full max-w-sm mx-auto mt-2"
            />
          </div>
        )}

        {/* 🔹 Botões dinâmicos */}
        {botao === "confirmar" && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => atualizarStatus(TrajetoStatus.CONFIRMADO)}
          >
            Confirmar Presença
          </Button>
        )}

        {botao === "voo" && (
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            onClick={() => atualizarStatus(TrajetoStatus.NO_VOO)}
          >
            Iniciar Voo
          </Button>
        )}

        <Button variant="default" asChild className="bg-gray-500 w-full mt-4">
          <Link
            href="https://wa.me/55999999999"
            target="_blank"
            rel="noopener noreferrer"
          >
            Suporte via WhatsApp
          </Link>
        </Button>
      </div>
    </main>
  );
}
