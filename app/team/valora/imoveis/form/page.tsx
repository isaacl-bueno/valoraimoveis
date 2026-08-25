import type { Metadata } from "next";
import { AdminShell } from "@/components/AdminShell";
import { PropertyForm } from "@/components/PropertyForm";
import { getPropertyById } from "@/lib/store";

export const metadata: Metadata = {
  title: "Editar imóvel | Equipe",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function TeamImovelFormPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const property = id ? await getPropertyById(id) : null;

  return (
    <AdminShell title={property ? "Editar imóvel" : "Novo imóvel"}>
      <PropertyForm initialProperty={property} />
    </AdminShell>
  );
}
