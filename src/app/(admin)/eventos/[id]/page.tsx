import { db } from "@/lib/firebase";
import { Convidado } from "@/lib/types";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import ListaConvidados from "@/components/ListaConvidados"; // 👈 1. IMPORTE O NOVO COMPONENTE
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type EventoPageProps = {
  params: { id: string };
};

/**
 * Página de detalhes para um evento específico.
 *
 * Este é um Componente de Servidor (`async`) do Next.js, responsável por:
 * 1. Buscar os dados de um evento específico no Firestore usando o ID da URL.
 * 2. Buscar a subcoleção de convidados associada a esse evento.
 * 3. Renderizar as informações do evento e delegar a exibição da lista de
 * convidados para o componente de cliente `<ListaConvidados />`.
 *
 * @param props - As propriedades da página, fornecidas pelo Next.js.
 * @param props.params - Os parâmetros da rota dinâmica.
 * @param props.params.id - O ID do evento a ser buscado e exibido.
 * @returns Uma Promise que resolve para o elemento JSX da página do evento.
 */
export default async function EventoPage({ params }: EventoPageProps) {
  const { id } = params;

  // 1. Buscar dados do evento
  const eventoRef = doc(db, "eventos", id);
  const eventoSnap = await getDoc(eventoRef);

  if (!eventoSnap.exists()) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Evento não encontrado.</p>
      </main>
    );
  }
  const evento = eventoSnap.data();

  // 2. Buscar convidados
  const convidadosRef = collection(db, "eventos", id, "convidados");
  const convidadosSnap = await getDocs(convidadosRef);
  const convidados: Convidado[] = convidadosSnap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Convidado, "id">),
  }));

  return (
    <div className="flex flex-col space-y-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/eventos">Gerenciar Eventos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Evento</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <hr />
      <div className="bg-white rounded-xl shadow p-6 space-y-2">
        <h1 className="text-2xl font-bold">{evento.nome}</h1>
        <p className="text-gray-600">📍 {evento.local}</p>
        <p className="text-gray-600">
          📅 {evento.data?.toDate().toLocaleDateString("pt-BR")}
        </p>
      </div>

      {/* Lista de convidados */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Convidados ({convidados.length})
        </h2>

        <ListaConvidados convidados={convidados} eventoId={id} />
      </div>
    </div>
  );
}
