"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Evento, Convidado, TrajetoStatus } from "@/lib/types";
import jsQR from "jsqr"; // ✅ Importa o decodificador

// Função para desenhar e tentar ler o QR Code
function decodeQrCode(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D | null
): string | null {
  if (!ctx) return null;

  // Garante que o canvas tenha o mesmo tamanho do vídeo
  canvas.height = video.videoHeight;
  canvas.width = video.videoWidth;

  // Desenha o frame do vídeo no canvas
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Obtém os dados da imagem
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Decodifica o QR Code
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });

  if (code) {
    // Desenha uma caixa ao redor do QR code decodificado (opcional)
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
    ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
    ctx.lineTo(
      code.location.bottomRightCorner.x,
      code.location.bottomRightCorner.y
    );
    ctx.lineTo(
      code.location.bottomLeftCorner.x,
      code.location.bottomLeftCorner.y
    );
    ctx.closePath();
    ctx.stroke();

    return code.data;
  }
  return null;
}

export default function HomeTeam() {
  const { user, logout } = useAuth();
  const [eventos, setEventos] = useState<
    (Evento & { convidados: Convidado[] })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // ✅ Refs para os elementos da câmera e do canvas
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number>(0); // Para o requestAnimationFrame loop
  const mediaStreamRef = useRef<MediaStream | null>(null); // Para guardar o stream da câmera

  // =========================================================================
  // FUNÇÕES DE CÂMERA E SCAN
  // =========================================================================

  // Função para processar o frame do vídeo
  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.paused) {
      // Não faz nada se o vídeo não estiver ativo ou não houver refs
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Tenta decodificar o QR Code
    const data = decodeQrCode(video, canvas, ctx);

    if (data) {
      setScanning(false); // Para o scan após sucesso
      processScannedData(data);
      return; // Interrompe o loop
    }

    // Continua o loop no próximo frame
    requestRef.current = requestAnimationFrame(tick);
  }, []);

  // Função para iniciar a câmera e o loop de scan
  const startCamera = useCallback(async () => {
    setQrError(null);
    if (!videoRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      mediaStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");
      await videoRef.current.play(); // Espera o play para garantir que o vídeo esteja carregado

      // Inicia o loop de scan
      requestRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      setQrError("Erro ao acessar a câmera. Verifique as permissões.");
      setScanning(false); // Fecha o leitor em caso de erro
    }
  }, [tick]);

  // Função para parar a câmera e o loop
  const stopCamera = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Efeito principal para controlar o ciclo de vida da câmera
  useEffect(() => {
    if (scanning) {
      startCamera();
    } else {
      stopCamera();
    }
    // A função de retorno garante que a câmera seja liberada na desmontagem
    return stopCamera;
  }, [scanning, startCamera, stopCamera]);

  // Função que lida com o dado lido pelo QR Code
  async function processScannedData(data: string) {
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

  // =========================================================================
  // FUNÇÕES DE FIREBASE (inalteradas)
  // =========================================================================

  useEffect(() => {
    fetchEventosEConvidados();
  }, []);

  async function fetchEventosEConvidados() {
    setLoading(true);
    // ... (restante do código de fetchEventosEConvidados)
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

      // Não chame fetchEventosEConvidados() aqui, é muito caro.
      // Em vez disso, atualize o estado local (opcionalmente) ou force um refresh
      // Mas para manter a simplicidade, vamos manter a chamada
      await fetchEventosEConvidados();
      alert(`✅ Status atualizado para: ${novoStatus}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar status.");
    } finally {
      setUpdating(null);
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
        <div className="w-80 max-w-full mt-4 border-2 border-dashed rounded-lg overflow-hidden relative">
          {/* O elemento VIDEO para exibir o stream da câmera */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ display: "block" }} // Garante que o vídeo seja visível
            autoPlay
            playsInline
            muted // Essencial para autoPlay em alguns browsers
          />
          {/* O elemento CANVAS para processar o frame e desenhar a caixa do QR Code */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      )}

      {qrError && <p className="text-red-600 font-medium mt-2">{qrError}</p>}

      {/* LISTA DE EVENTOS (inalterada) */}
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
