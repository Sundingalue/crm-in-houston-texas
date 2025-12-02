"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type FieldType = "text" | "number" | "select";

type Field = {
  name: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

type Item = {
  id: string;
  name?: string;
  [key: string]: unknown;
};

type Props = {
  title: string;
  subtitle: string;
  endpoint: string;
  fields: Field[];
  displayKey?: string;
  badge?: string;
};

export const EntityEditor = ({ title, subtitle, endpoint, fields, displayKey = "name", badge }: Props) => {
  const dict = useDictionary();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId), [items, selectedId]);

  const fetchItems = async () => {
    const res = await fetch(endpoint);
    if (!res.ok) return;
    const data = await res.json();
    setItems(data);
    if (data[0]) {
      setSelectedId(data[0].id);
      const nextForm: Record<string, string | number> = {};
      fields.forEach((field) => {
        nextForm[field.name] = (data[0][field.name] as string | number | undefined) ?? "";
      });
      setForm(nextForm);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const nextForm: Record<string, string | number> = {};
    fields.forEach((field) => {
      const value = selectedItem[field.name];
      nextForm[field.name] = typeof value === "number" ? value : (value as string) ?? "";
    });
    setForm(nextForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  const update = () => {
    if (!selectedId) return;
    startTransition(async () => {
      setStatus(null);
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId, ...form, value: Number(form.value ?? 0) }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.updated : body.message ?? dict.errors.default);
      if (res.ok) fetchItems();
    });
  };

  const remove = () => {
    if (!selectedId) return;
    startTransition(async () => {
      setStatus(null);
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.deleted : body.message ?? dict.errors.default);
      if (res.ok) fetchItems();
    });
  };

  return (
    <Card title={title} subtitle={subtitle} badge={badge ?? dict.forms.editBadge}>
      <div className="grid gap-3 text-sm">
        <select
          className="w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {(item[displayKey] as string) ?? item.id}
            </option>
          ))}
        </select>
        {fields.map((field) => {
          if (field.type === "select" && field.options) {
            return (
              <select
                key={field.name}
                className="w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2"
                value={form[field.name] ?? ""}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <input
              key={field.name}
              type={field.type === "number" ? "number" : "text"}
              className="w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2"
              placeholder={field.label}
              value={form[field.name] ?? ""}
              onChange={(e) => setForm({ ...form, [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value })}
            />
          );
        })}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={update}
            disabled={isPending || !selectedId}
            className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? dict.forms.saving : dict.forms.update}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={isPending || !selectedId}
            className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold"
          >
            {dict.forms.delete}
          </button>
        </div>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
    </Card>
  );
};
