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

type EventoPageProps = {
  params: { id: string };
};

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
      </div>

      {/* Lista de convidados em tempo real */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Convidados</h2>
        <ListaConvidados eventoId={id} />
      </div>
    </div>
  );
}
