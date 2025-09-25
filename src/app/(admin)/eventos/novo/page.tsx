"use client";

import CadastrarEventoForm from "@/components/CadastrarEventoForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function NovoEventoPage() {
  return (
    <div className="space-y-6">
      {/* Header com Breadcrumb */}
      <div className="flex flex-col space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/eventos">Gerenciar Eventos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Cadastrar Novo Evento</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <hr />
        <h1 className="text-xl font-semibold tracking-tight">
          Cadastrar Novo Evento
        </h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados do evento e importe convidados se desejar.
        </p>
      </div>

      {/* Formulário */}
      <CadastrarEventoForm />
    </div>
  );
}
