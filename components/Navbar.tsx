"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Trash2, X } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Início" },
  { href: "/imoveis", label: "Imóveis" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export function Navbar() {
  const pathname = usePathname();
  const { favorites, count, removeFavorite, clearFavorites, ready } = useFavorites();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (!open) return;
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-surface/80 backdrop-blur-md border border-line rounded-full px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/Logovalora.png"
            alt="Valora Imóveis"
            className="h-9 w-auto object-contain"
          />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-ink">
          {links.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "relative nav-link border-b border-brand pb-1"
                    : "relative nav-link opacity-60 hover:opacity-100 transition-opacity"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            className="p-2 hover:text-brand transition-colors relative"
            aria-label="Favoritos"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            <Heart className={`h-5 w-5 ${count > 0 ? "fill-orange text-orange" : ""}`} />
            <span className="absolute -top-1 -right-1 bg-orange text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {ready ? Math.min(count, 99) : 0}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(22rem,calc(100vw-2rem))] rounded-3xl border border-line bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <div>
                  <p className="font-bold text-ink">Favoritos</p>
                  <p className="text-xs text-muted">
                    {count === 0
                      ? "Nenhum imóvel salvo"
                      : `${count} ${count === 1 ? "imóvel salvo" : "imóveis salvos"}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted hover:text-ink"
                  aria-label="Fechar"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {favorites.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Heart className="h-8 w-8 mx-auto text-muted mb-3" />
                    <p className="text-sm text-muted">
                      Clique no coração nos imóveis para salvá-los aqui.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href="/imoveis" onClick={() => setOpen(false)}>
                        Ver imóveis
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {favorites.map((item) => (
                      <li
                        key={item.slug}
                        className="flex gap-3 p-4 hover:bg-surface/80 transition-colors"
                      >
                        <Link
                          href={`/imoveis/${item.slug}`}
                          className="flex gap-3 flex-1 min-w-0"
                          onClick={() => setOpen(false)}
                        >
                          <img
                            src={item.image}
                            alt=""
                            className="w-16 h-14 rounded-xl object-cover bg-surface shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-ink truncate">{item.title}</p>
                            <p className="text-xs text-muted truncate">{item.location}</p>
                            <p className="text-sm font-medium text-brand mt-1">{item.priceLabel}</p>
                          </div>
                        </Link>
                        <button
                          type="button"
                          className="self-start w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted hover:text-red-600 hover:border-red-200"
                          aria-label={`Remover ${item.title}`}
                          onClick={() => removeFavorite(item.slug)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {favorites.length > 0 && (
                <div className="flex gap-2 px-4 py-3 border-t border-line bg-surface/50">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href="/imoveis" onClick={() => setOpen(false)}>
                      Ver catálogo
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={clearFavorites}
                  >
                    Limpar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
