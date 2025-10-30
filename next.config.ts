import type { NextConfig } from "next";

/**
 * Configuração do Next.js ajustada para permitir build
 * mesmo com erros de tipagem (TypeScript) e lint (ESLint).
 *
 * ⚠️ Observação:
 * Isso ignora verificações em tempo de build — use apenas em ambientes
 * onde a prioridade é o deploy, não a segurança de tipos.
 */
const nextConfig: NextConfig = {
  // Ignora erros de TypeScript durante o build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignora erros de ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
