import { revalidatePath } from "next/cache";

export function revalidatePropertyPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/imoveis");
  if (slug) {
    revalidatePath(`/imoveis/${slug}`);
  }
}
