import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import qrcode from "qrcode";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function confirm(formData: FormData) {
  "use server"; // This is the directive that makes this function a Server Action

  console.log(formData.get("confirmarPresenca"));
}

type ConvidadoPageProps = {
  params: { id: string };
  searchParams: { eventoId?: string };
};
/**
 * Página que exibe os detalhes de um convidado específico em um evento.
 *
 * Esta função:
 *  - Recebe via `params` o ID do convidado.
 *  - Recebe via `searchParams` o `eventoId` que identifica o evento no Firestore.
 *  - Caso `eventoId` não seja informado, mostra uma mensagem de erro.
 *  - Busca os dados do convidado na coleção `eventos/{eventoId}/convidados/{id}` do Firestore.
 *  - Busca também as informações do evento em `eventos/{eventoId}`.
 *  - Caso o convidado não exista, exibe mensagem de "não encontrado".
 *  - Renderiza os dados básicos do convidado (nome, CPF, telefone, título, cidade).
 *  - Caso o convidado tenha informações de voo, renderiza também esses detalhes.
 *
 * @param {ConvidadoPageProps} props - Objeto contendo os parâmetros da rota e os parâmetros de busca.
 * @returns {Promise<JSX.Element>} Um componente React com os detalhes do convidado ou mensagens de erro.
 */
export default async function ConvidadoPage({
  params,
  searchParams,
}: ConvidadoPageProps) {
  const { id } = params;
  const eventoId = searchParams.eventoId;

  if (!eventoId) {
    return (
      <main className="flex items-start justify-center min-h-screen">
        <p className="text-red-500">
          ⚠️ É necessário informar o eventoId na URL
        </p>
      </main>
    );
  }

  // 🔹 Buscar evento
  const eventoRef = doc(db, "eventos", eventoId);
  const eventoSnap = await getDoc(eventoRef);

  if (!eventoSnap.exists()) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Evento não encontrado.</p>
      </main>
    );
  }

  const evento = eventoSnap.data();

  // 🔹 Garantir formatação da data
  let dataEvento: string | null = null;
  if (evento.data instanceof Timestamp) {
    dataEvento = evento.data.toDate().toLocaleDateString("pt-BR");
  } else if (evento.data) {
    dataEvento = String(evento.data);
  }

  // 1. Buscar convidado
  const convidadoRef = doc(db, "eventos", eventoId, "convidados", id);
  const snapshot = await getDoc(convidadoRef);

  if (!snapshot.exists()) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Convidado não encontrado.</p>
      </main>
    );
  }

  const convidado = snapshot.data();

  const qrCode = await qrcode.toDataURL(
    `https://seu-dominio.com/convidado/${id}?eventoId=${eventoId}`
  );

  return (
    <main className="flex items-start justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">
          Olá, {convidado.titulo} {convidado.nome}
        </h1>
        <div className="text-gray-600">
          Você foi convidado para o Evento {evento.nome}.
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-bold text-gray-600">Local: {evento.local}</p>
          <p className="font-bold text-gray-600">
            Data: {dataEvento ?? "Não informada"}
          </p>
          <p className="text-gray-500">Sua cidade: {convidado.cidade}</p>
        </div>

        <form
          className="mt-4 p-4 border border-gray-300 rounded-lg flex flex-col gap-2"
          action={confirm}
        >
          <p>Esse QR Code é a sua credencial de acesso.</p>

          {typeof qrCode === "string" && (
            <img
              src={qrCode}
              alt="QR Code"
              className="w-full max-w-sm mx-auto"
            />
          )}

          <Button>Confirmar Presença</Button>
        </form>

        <Button variant={"default"} asChild className="bg-blue-400 w-full">
          <Link
            href={"https://wa.me/55999999999"}
            target="_blank"
            rel="noopener noreferrer"
          >
            Suporte
          </Link>
        </Button>
      </div>
    </main>
  );
}
