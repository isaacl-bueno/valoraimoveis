"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
];

export function PropertySortSelect() {
  const [value, setValue] = useState("recentes");

  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="h-9 w-[160px] border-none bg-transparent shadow-none px-2 font-medium focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
