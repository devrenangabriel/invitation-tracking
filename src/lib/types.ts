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
  } | null;
  trajeto: Record<string, any>;
};

export type Evento = {
  id: string;
  nome: string;
  local: string;
  data: string;
  convidados: Convidado[];
};
