import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { AdminPropertiesTable } from "@/components/AdminPropertiesTable";
import { Button } from "@/components/ui/button";
import { TEAM_IMOVEL_FORM } from "@/lib/routes";
import { listAdminProperties } from "@/lib/store";

export const metadata: Metadata = {
  title: "Imóveis | Equipe",
};

export const dynamic = "force-dynamic";

export default async function TeamImoveisPage() {
  const items = await listAdminProperties();

  return (
    <AdminShell title="Imóveis">
      <div className="p-6 md:p-10 max-w-[1500px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <p className="text-muted">Gerencie os imóveis disponíveis no site.</p>
          <Button asChild>
            <Link href={TEAM_IMOVEL_FORM}>
              <Plus className="h-4 w-4" />
              Novo imóvel
            </Link>
          </Button>
        </div>
        <AdminPropertiesTable items={items} />
      </div>
    </AdminShell>
  );
}
