"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Evento, Convidado, TrajetoStatus } from "@/lib/types";
import dynamic from "next/dynamic";

// ✅ O import dinâmico está correto para Next.js
const QrReader = dynamic(
  () => import("react-qr-reader").then((mod) => mod.QrReader),
  { ssr: false }
);

export default function HomeTeam() {
  const { user, logout } = useAuth();
  const [eventos, setEventos] = useState<
    (Evento & { convidados: Convidado[] })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchEventosEConvidados();
  }, []);

  async function fetchEventosEConvidados() {
    setLoading(true);
    try {
      const eventosSnap = await getDocs(collection(db, "eventos"));
      const eventosData: (Evento & { id: string; convidados: Convidado[] })[] =
        [];

      for (const eventoDoc of eventosSnap.docs) {
        const evento = eventoDoc.data() as Evento;
        const convidadosSnap = await getDocs(
          collection(db, "eventos", eventoDoc.id, "convidados")
        );

        const convidados: Convidado[] = convidadosSnap.docs.map((c) => ({
          id: c.id,
          ...(c.data() as Omit<Convidado, "id">),
        }));

        eventosData.push({
          id: eventoDoc.id,
          ...evento,
          convidados,
        });
      }

      setEventos(eventosData);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(eventoId: string, convidadoId: string) {
    try {
      setUpdating(convidadoId);
      const convidadoRef = doc(
        db,
        "eventos",
        eventoId,
        "convidados",
        convidadoId
      );
      const convidadoSnap = await getDoc(convidadoRef);
      if (!convidadoSnap.exists()) return;

      const convidado = convidadoSnap.data() as Convidado;
      const ultimoStatus =
        convidado.trajeto?.[convidado.trajeto.length - 1]?.status ||
        TrajetoStatus.PENDENTE;

      let novoStatus: TrajetoStatus | null = null;

      if (
        [
          TrajetoStatus.PENDENTE,
          TrajetoStatus.CONFIRMADO,
          TrajetoStatus.NO_VOO,
        ].includes(ultimoStatus)
      ) {
        novoStatus = TrajetoStatus.COM_EQUIPE;
      } else if (ultimoStatus === TrajetoStatus.COM_EQUIPE) {
        novoStatus = TrajetoStatus.COM_MOTORISTA;
      }

      if (!novoStatus) {
        alert(
          "Este convidado já está com o motorista. Não é possível alterar."
        );
        return;
      }

      await updateDoc(convidadoRef, {
        trajeto: [
          ...(convidado.trajeto || []),
          { status: novoStatus, data: new Date() },
        ],
      });

      await fetchEventosEConvidados();
      alert(`✅ Status atualizado para: ${novoStatus}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar status.");
    } finally {
      setUpdating(null);
    }
  }

  // ✅ CORREÇÃO: A função handleScan agora se chama handleResult e trata o resultado da nova API
  async function handleResult(result: any, error: any) {
    if (!!error) {
      setQrError(error?.message);
      return;
    }

    if (!!result) {
      const data = result?.getText();
      if (data) {
        setScanning(false); // Fecha o scanner após uma leitura bem-sucedida
        try {
          const parsed = JSON.parse(data);
          if (parsed.eventoId && parsed.convidadoId) {
            await atualizarStatus(parsed.eventoId, parsed.convidadoId);
          } else {
            setQrError("QR inválido: dados incompletos.");
          }
        } catch {
          setQrError("Formato de QR inválido.");
        }
      }
    }
  }

  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </main>
    );

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-950 p-8 gap-6">
      <h1 className="text-3xl font-bold">Área da Equipe</h1>

      <Button
        variant={scanning ? "destructive" : "default"}
        onClick={() => setScanning(!scanning)}
      >
        {scanning ? "Fechar Leitor" : "📷 Ler QR Code"}
      </Button>

      {scanning && (
        <div className="w-80 max-w-full mt-4 border-2 border-dashed rounded-lg overflow-hidden">
          {/* ✅ CORREÇÃO: Atualização das propriedades do QrReader para a versão 3+ */}
          <QrReader
            onResult={handleResult}
            constraints={{ facingMode: "environment" }} // Pede a câmera traseira
            className="w-full"
          />
        </div>
      )}

      {qrError && <p className="text-red-600 font-medium mt-2">{qrError}</p>}

      {/* LISTA DE EVENTOS */}
      <section className="w-full max-w-5xl space-y-6 mt-8">
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow"
          >
            <h2 className="text-2xl font-semibold">{evento.nome}</h2>
            <p className="text-gray-600">
              📍 {evento.local} —{" "}
              {evento.data?.toDate
                ? evento.data.toDate().toLocaleDateString("pt-BR")
                : new Date(evento.data).toLocaleDateString("pt-BR")}
            </p>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">
                Convidados ({evento.convidados.length})
              </h3>

              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {evento.convidados.map((c) => {
                  const ultimoStatus =
                    c.trajeto?.[c.trajeto.length - 1]?.status ||
                    TrajetoStatus.PENDENTE;

                  const isFinal = ultimoStatus === TrajetoStatus.COM_MOTORISTA;

                  return (
                    <li
                      key={c.id}
                      className="border rounded-lg p-4 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <p className="font-semibold text-lg">{c.nome}</p>
                        <p className="text-sm text-gray-600">
                          📞 {c.telefone || "Não informado"}
                        </p>
                        <div className="mt-2">
                          <span className="text-sm text-gray-600 mr-2">
                            Status:
                          </span>
                          {isFinal ? (
                            <Badge className="bg-green-500 text-white">
                              {ultimoStatus}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">{ultimoStatus}</Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        className="mt-3"
                        variant="outline"
                        disabled={isFinal || updating === c.id}
                        onClick={() => atualizarStatus(evento.id, c.id)}
                      >
                        {isFinal
                          ? "Finalizado ✅"
                          : updating === c.id
                          ? "Atualizando..."
                          : "Atualizar Status"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
