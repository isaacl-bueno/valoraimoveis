import { Spinner } from "@/components/ui/spinner";

export function PageLoader({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6 py-24">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-muted tracking-wide">{label}</p>
    </div>
  );
}
