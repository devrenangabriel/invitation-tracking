// utils/parseConvidadosExcel.ts
import * as XLSX from "xlsx";
import { nanoid } from "nanoid";
import { Convidado, TrajetoStatus } from "./types";

export async function parseGuestExcel(file: File): Promise<Convidado[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellText: true });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        // Função robusta para interpretar coordenadas
        const parseCoordinate = (value: any): number | null => {
          if (value === undefined || value === null || value === "")
            return null;

          // limpa e normaliza
          const str = String(value)
            .trim()
            .replace(",", ".")
            .replace(/[^\d.-]/g, "");
          if (str === "" || str === "-" || str === ".") return null;

          const negative = str.startsWith("-");
          const digits = str.replace("-", "");

          // se já contém ponto decimal, apenas parseFloat normalmente
          if (digits.includes(".")) {
            const num = parseFloat((negative ? "-" : "") + digits);
            return isNaN(num) ? null : num;
          }

          // se for um inteiro "compactado" (ex: 7082053 ou 41467787), insere o ponto
          // deixando exatamente 6 casas decimais à direita
          if (digits.length > 6) {
            const insertPos = digits.length - 6; // ex: len7 -> pos1, len8 -> pos2
            const corrected = `${negative ? "-" : ""}${digits.slice(
              0,
              insertPos
            )}.${digits.slice(insertPos)}`;
            const num = parseFloat(corrected);
            return isNaN(num) ? null : num;
          }

          // fallback: parse normal
          const num = parseFloat((negative ? "-" : "") + digits);
          return isNaN(num) ? null : num;
        };

        const convidados: Convidado[] = rows.map((row) => ({
          id: nanoid(),
          nome: String(row["nome"] || "").trim(),
          cpf: String(row["cpf"] || "").trim(),
          telefone: String(row["telefone"] || "").trim(),
          titulo: String(row["titulo"] || "").trim(),
          cidade: String(row["cidade"] || "").trim(),
          voo: row["num_voo"]
            ? {
                num_voo: String(row["num_voo"] || "").trim(),
                data_saida: String(row["data_saida"] || "").trim(),
                hora_saida: String(row["hora_saida"] || "").trim(),
                data_chegada: String(row["data_chegada"] || "").trim(),
                hora_chegada: String(row["hora_chegada"] || "").trim(),
                ciaAerea: String(
                  row["cia_aerea"] || row["ciaAerea"] || ""
                ).trim(),
                aeroporto_lat: parseCoordinate(row["aeroporto_lat"]),
                aeroporto_log: parseCoordinate(row["aeroporto_log"]),
              }
            : null,
          trajeto: [
            {
              data: new Date().toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              }),
              status: TrajetoStatus.PENDENTE,
              idEquipeDeCampo: null,
            },
          ],
        }));

        resolve(convidados);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
