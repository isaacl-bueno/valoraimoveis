"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCitiesByState } from "@/lib/brazil-cities";
import { BRAZIL_STATES } from "@/lib/brazil-states";
import { fetchAddressByCep, formatCep, normalizeCep } from "@/lib/cep";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

export type AddressFormSlice = {
  cep: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
};

type PropertyAddressFieldsProps = {
  values: AddressFormSlice;
  onChange: (patch: Partial<AddressFormSlice>) => void;
  onCepMessage?: (message: string | null) => void;
};

export function PropertyAddressFields({
  values,
  onChange,
  onCepMessage,
}: PropertyAddressFieldsProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    const uf = values.state.trim().toUpperCase();
    if (!uf) {
      setCities([]);
      return;
    }

    let cancelled = false;
    setLoadingCities(true);

    fetchCitiesByState(uf)
      .then((list) => {
        if (cancelled) return;
        setCities(list);
      })
      .catch(() => {
        if (cancelled) return;
        setCities([]);
        onCepMessage?.("Não foi possível carregar a lista de cidades.");
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });

    return () => {
      cancelled = true;
    };
  }, [values.state, onCepMessage]);

  const cityOptions = useMemo(() => {
    if (!values.city) return cities;
    if (cities.includes(values.city)) return cities;
    return [values.city, ...cities];
  }, [cities, values.city]);

  async function lookupCep(rawCep: string) {
    const digits = normalizeCep(rawCep);
    if (digits.length !== 8) return;

    setLoadingCep(true);
    onCepMessage?.(null);

    try {
      const result = await fetchAddressByCep(digits);
      if (!result) {
        onCepMessage?.("CEP não encontrado.");
        return;
      }

      onChange({
        cep: formatCep(result.cep || digits),
        address: result.logradouro || values.address,
        neighborhood: result.bairro || values.neighborhood,
        city: result.localidade,
        state: result.uf,
      });
      onCepMessage?.("Endereço preenchido pelo CEP.");
    } catch {
      onCepMessage?.("Falha ao consultar o CEP.");
    } finally {
      setLoadingCep(false);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-5">
      <div>
        <Label htmlFor="property-cep">CEP</Label>
        <div className="relative">
          <Input
            id="property-cep"
            inputMode="numeric"
            placeholder="00000-000"
            value={values.cep}
            maxLength={9}
            onChange={(event) => onChange({ cep: formatCep(event.target.value) })}
            onBlur={() => void lookupCep(values.cep)}
          />
          {loadingCep && (
            <Spinner
              size="sm"
              className="absolute right-3 top-1/2 -translate-y-1/2 border-brand"
            />
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted">Busca automática ao sair do campo.</p>
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="property-address">Endereço</Label>
        <Input
          id="property-address"
          value={values.address}
          onChange={(event) => onChange({ address: event.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="property-number">Número</Label>
        <Input
          id="property-number"
          value={values.number}
          onChange={(event) => onChange({ number: event.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="property-neighborhood">Bairro</Label>
        <Input
          id="property-neighborhood"
          value={values.neighborhood}
          onChange={(event) => onChange({ neighborhood: event.target.value })}
        />
      </div>

      <div>
        <Label>Estado</Label>
        <Select
          value={values.state || undefined}
          onValueChange={(uf) => onChange({ state: uf, city: "" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {BRAZIL_STATES.map((state) => (
              <SelectItem key={state.uf} value={state.uf}>
                {state.name} ({state.uf})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Cidade</Label>
        <Select
          value={values.city || undefined}
          onValueChange={(city) => onChange({ city })}
          disabled={!values.state || loadingCities}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !values.state
                  ? "Selecione o estado primeiro"
                  : loadingCities
                    ? "Carregando cidades..."
                    : "Selecione a cidade"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {cityOptions.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="property-latitude">Latitude</Label>
        <Input
          id="property-latitude"
          value={values.latitude}
          onChange={(event) => onChange({ latitude: event.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="property-longitude">Longitude</Label>
        <Input
          id="property-longitude"
          value={values.longitude}
          onChange={(event) => onChange({ longitude: event.target.value })}
        />
      </div>
    </div>
  );
}
