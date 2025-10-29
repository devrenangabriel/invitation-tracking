import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import ListaConvidados from "@/components/ListaConvidados";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ExportarRelatorioEvento from "@/components/ExportarRelatorioEvento";

type EventoPageProps = {
  params: { id: string };
};

/**
 * Página de detalhes de um evento específico.
 *
 * Esta função busca os dados de um evento no Firestore com base no ID fornecido
 * através dos parâmetros da rota. Caso o evento não seja encontrado, é exibida
 * uma mensagem de erro. Caso exista, renderiza as informações do evento (nome,
 * local e data) e uma lista de convidados associada ao evento.
 *
 * @param {EventoPageProps} params - Parâmetros da rota contendo o ID do evento.
 * @returns {JSX.Element} Página com informações do evento e a lista de convidados.
 */
export default async function EventoPage({ params }: EventoPageProps) {
  const { id } = params;

  // Buscar dados do evento
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
        <ExportarRelatorioEvento eventoId={id} />
      </div>

      {/* Lista de convidados em tempo real */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Convidados</h2>
        <ListaConvidados eventoId={id} />
      </div>
    </div>
  );
}
