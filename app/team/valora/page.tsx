import { redirect } from "next/navigation";
import { TEAM_IMOVIES } from "@/lib/routes";

export default function TeamValoraIndexPage() {
  redirect(TEAM_IMOVIES);
}
