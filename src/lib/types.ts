import { Timestamp } from "firebase/firestore";

export enum TrajetoStatus {
  PENDENTE = "Pendente",
  CONFIRMADO = "Confirmado",
  NO_VOO = "No Voo",
  COM_EQUIPE = "Com a Equipe de Campo",
  COM_MOTORISTA = "Com o Motorista",
  FINALIZADO = "Finalizado",
}

export type Convidado = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  titulo: string;
  cidade: string;
  voo: {
    num_voo: string;
    data_saida: string;
    hora_saida: string;
    data_chegada: string;
    hora_chegada: string;
    ciaAerea: string;
    aeroporto_lat: number | null;
    aeroporto_log: number | null;
  } | null;
  trajeto: {
    data: string;
    status: TrajetoStatus;
    idEquipeDeCampo: string | null;
  }[];
};

export type Evento = {
  id: string;
  nome: string;
  local: string;
  data: Timestamp; // armazenado no Firestore como Timestamp
  latitude: number;
  longitude: number;
  convidados: Convidado[];
};
