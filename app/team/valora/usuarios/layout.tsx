import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuários | Equipe",
};

export default function AdminUsuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
