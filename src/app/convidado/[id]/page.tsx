import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
 *  - Caso o convidado não exista, exibe mensagem de "não encontrado".
 *  - Renderiza os dados básicos do convidado (nome, CPF, telefone, título, cidade).
 *  - Caso o convidado tenha informações de voo, renderiza também esses detalhes.
 *
 * @param {ConvidadoPageProps} props - Objeto contendo os parâmetros da rota e os parâmetros de busca.
 * @returns {Promise<JSX.Element>} Um componente React com os detalhes do convidado ou mensagens de erro.
 */
export default async function ConvidadoPage({ params, searchParams }: ConvidadoPageProps) {
  const { id } = params;
  const eventoId = searchParams.eventoId;

  if (!eventoId) {
    return (
      <main className="flex items-start justify-center min-h-screen">
        <p className="text-red-500">⚠️ É necessário informar o eventoId na URL</p>
      </main>
    );
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

  return (
    <main className="flex items-start justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Olá, {convidado.titulo} {convidado.nome}</h1>
        <div className="text-gray-600">
            Você foi convidado para o Evento {"Teste"}.
        </div>
        <div className="space-y-2 text-sm">

          <p className="font-bold text-gray-600">Local: {convidado.cidade}</p>
          <p className="font-bold text-gray-600">Data: {convidado.data}</p>

        </div>

        <div className="mt-4 p-4 border border-gray-300 rounded-lg flex flex-col gap-2">
            <p>Esse QR Code é a sua credencial de acesso.</p>
        </div>

      </div>
    </main>
  );
}
