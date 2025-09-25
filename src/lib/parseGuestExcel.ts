// utils/parseConvidadosExcel.ts
import * as XLSX from "xlsx";
import { nanoid } from "nanoid";
import { Convidado } from "./types";

export async function parseGuestExcel(file: File): Promise<Convidado[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

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
                ciaAerea: String(row["ciaAerea"] || "").trim(),
              }
            : null,
          trajeto: {},
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
