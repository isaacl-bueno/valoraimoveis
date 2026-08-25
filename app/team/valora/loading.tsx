import { PageLoader } from "@/components/PageLoader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-page">
      <PageLoader label="Carregando área da equipe..." />
    </div>
  );
}
