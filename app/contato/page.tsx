"use client";

import { FormEvent, useState } from "react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contact, whatsappLink } from "@/lib/contact";

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  const [assunto, setAssunto] = useState("interesse");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <SiteShell>
      <main className="pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <span className="text-xs uppercase tracking-[.22em] text-brand font-bold">
                Contato
              </span>
              <h1 className="h-display text-5xl md:text-6xl mt-4 mb-6">Fale com a Valora</h1>
              <p className="text-lg text-muted max-w-xl leading-relaxed mb-10">
                Quer comprar ou saber mais sobre um imóvel? Nossa equipe está pronta para conversar
                com você.
              </p>
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-line rounded-3xl p-8 md:p-10 shadow-sm space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label>Nome</Label>
                    <Input placeholder="Seu nome" required />
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input type="email" placeholder="voce@email.com" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label>Telefone</Label>
                    <Input placeholder="(41) 99999-9999" />
                  </div>
                  <div>
                    <Label>Assunto</Label>
                    <Select value={assunto} onValueChange={setAssunto}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interesse">Tenho interesse em um imóvel</SelectItem>
                        <SelectItem value="informacoes">Quero mais informações</SelectItem>
                        <SelectItem value="outro">Outro assunto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Mensagem</Label>
                  <Textarea placeholder="Como podemos ajudar?" />
                </div>
                <Button type="submit" size="lg">
                  {sent ? "Mensagem enviada" : "Enviar mensagem"}
                  <i className="fa-regular fa-paper-plane" />
                </Button>
              </form>
            </div>
            <aside className="space-y-6">
              <div className="bg-surface rounded-3xl p-8 md:p-10 border border-line">
                <h2 className="h-display text-3xl mb-8">Informações de contato</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center text-brand">
                      <i className="fa-solid fa-location-dot" />
                    </span>
                    <div>
                      <p className="font-bold">Endereço</p>
                      <p className="text-muted-foreground text-sm mt-1">
                        {contact.addressLine1}
                        <br />
                        {contact.addressLine2}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center text-brand">
                      <i className="fa-brands fa-whatsapp" />
                    </span>
                    <div>
                      <p className="font-bold">WhatsApp</p>
                      <p className="text-muted-foreground text-sm mt-1">{contact.whatsappDisplay}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center text-brand">
                      <i className="fa-regular fa-envelope" />
                    </span>
                    <div>
                      <p className="font-bold">E-mail</p>
                      <p className="text-muted-foreground text-sm mt-1">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-12 h-12 rounded-2xl bg-white border border-line flex items-center justify-center text-brand">
                      <i className="fa-regular fa-clock" />
                    </span>
                    <div>
                      <p className="font-bold">Atendimento</p>
                      <p className="text-muted-foreground text-sm mt-1">{contact.hoursWeekday}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-brand text-white px-5 py-3 rounded-full text-sm font-bold"
                  >
                    Falar pelo WhatsApp
                  </a>
                  <a
                    href={contact.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white border border-line px-5 py-3 rounded-full text-sm font-bold"
                  >
                    Ver localização
                  </a>
                </div>
              </div>
              <div className="h-80 rounded-3xl overflow-hidden border border-line bg-[#e7e3dd] relative">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(#cfc9c2 1px,transparent 1px),linear-gradient(90deg,#cfc9c2 1px,transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <span className="w-14 h-14 mx-auto rounded-full bg-brand text-white flex items-center justify-center">
                      <i className="fa-solid fa-location-dot" />
                    </span>
                    <p className="mt-3 font-bold">Valora Imóveis</p>
                    <p className="text-xs text-muted-foreground">{contact.cityState}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
