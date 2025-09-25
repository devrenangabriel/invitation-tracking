import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Evento = {
  id: string;
  nome: string;
  local: string;
  data: Date;
};

export async function getEventos(): Promise<Evento[]> {
  const eventosRef = collection(db, "eventos");
  const snapshot = await getDocs(eventosRef);

  const eventos: Evento[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data.nome,
      local: data.local,
      data: data.data?.toDate() ?? new Date(), // converte Timestamp para Date
    };
  });

  return eventos;
}
