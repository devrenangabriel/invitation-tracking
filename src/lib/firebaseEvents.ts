import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Evento = {
  id: string;
  nome: string;
  local: string;
  data: Date;
};
/**
 * @summary Busca todos os eventos da coleção "eventos" no Firestore.
 * @description Função assíncrona que se conecta ao Firestore, consulta
 * a coleção "eventos", e mapeia os documentos recuperados para
 * um array de objetos do tipo `Evento`.
 *
 * @returns {Promise<Evento[]>} Uma Promise que resolve com um array de `Evento`.
 *
 * @note
 * Esta função lida especificamente com a conversão do campo `data`
 * (que é um Timestamp do Firestore) para um objeto `Date` padrão do JavaScript
 * usando o método `.toDate()`.
 * Se o campo `data` for nulo ou indefinido no Firestore,
 * ele atribui a data atual (`new Date()`) como fallback.
 */
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
