"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type Suggestion = {
  id: string;
  text: string;
};

type SearchResult = {
  id: string;
  type: string;
  title: string;
  detail?: string;
};

export const AiPlayground = () => {
  const dict = useDictionary();
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isAgentPending, startAgent] = useTransition();
  const [isSearchPending, startSearch] = useTransition();

  const askAgent = () => {
    startAgent(async () => {
      setError(null);
      setResponse(null);
      if (!prompt.trim()) {
        setError("Escribe una petición para la IA.");
        return;
      }
      const res = await fetch("/api/ai/engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        setError("No se pudo generar una respuesta. Revisa tu API key.");
        return;
      }
      const data = await res.json();
      setResponse(data.content ?? data.suggestion ?? "Sin respuesta");
    });
  };

  const searchAi = () => {
    startSearch(async () => {
      setSearchError(null);
      setSearchResults([]);
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (!res.ok) {
        setSearchError("No se pudo consultar la búsqueda IA.");
        return;
      }
      const data = await res.json();
      setSearchResults(data.results ?? []);
    });
  };

  const suggestions: Suggestion[] = [
    { id: "s1", text: "¿Qué cuentas tienen riesgo alto este mes?" },
    { id: "s2", text: "Resume conversaciones clave con Nebula Foods." },
    { id: "s3", text: "Busca oportunidades con objeción de precio > €100k." },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card subtitle="IA Conversacional" title={dict.modules.ai.title}>
        <label className="text-xs font-semibold uppercase tracking-widest text-current/60">
          {dict.common.askAi}
          <textarea
            className="mt-2 w-full rounded-2xl border border-white/30 bg-transparent px-3 py-3"
            rows={4}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="¿Qué deals debo priorizar esta semana?"
          />
        </label>
        <button
          type="button"
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-white"
          onClick={askAgent}
          disabled={isAgentPending}
        >
          {isAgentPending ? "Generando..." : dict.ai.configure}
        </button>
        {error ? <p className="mt-2 text-sm text-amber-200">{error}</p> : null}
        {response ? <p className="mt-3 text-sm text-current/90">{response}</p> : null}
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              className="rounded-2xl border border-white/15 px-3 py-2 text-left text-current/80"
              onClick={() => setPrompt(suggestion.text)}
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      </Card>
      <Card subtitle="Búsqueda IA" title={dict.modules.ai.description}>
        <input
          type="search"
          className="w-full rounded-2xl border border-white/30 bg-transparent px-3 py-3"
          placeholder={dict.ai.searchPlaceholder}
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <button
          type="button"
          className="mt-4 w-full rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest"
          onClick={searchAi}
          disabled={isSearchPending}
        >
          {isSearchPending ? "Consultando..." : dict.ai.openHistory}
        </button>
        {searchError ? <p className="mt-2 text-sm text-amber-200">{searchError}</p> : null}
        {searchResults.length > 0 ? (
          <div className="mt-4 space-y-3">
            {searchResults.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <p className="font-semibold">{item.title}</p>
                {item.detail ? <p className="text-xs text-white/70">{item.detail}</p> : null}
                <p className="mt-1 text-[11px] uppercase tracking-widest text-white/40">{item.type}</p>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
};
