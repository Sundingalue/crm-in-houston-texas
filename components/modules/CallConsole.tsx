"use client";

import { useState, useTransition, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";
import { SparklesIcon } from "@heroicons/react/24/outline";

type ContactOption = {
  id: string;
  name: string;
  phone?: string | null;
};

type CallLog = {
  id: string;
  summary: string;
  durationSec: number | null;
  createdAt: string;
  recordingUrl?: string | null;
  aiSummary?: string | null;
};

type ActivityResponse = {
  id: string;
  summary: string | null;
  durationSec: number | null;
  createdAt: string;
  recordingUrl?: string | null;
  aiSummary?: string | null;
};

export const CallConsole = ({ contacts, defaultLeadId }: { contacts: ContactOption[]; defaultLeadId?: string }) => {
  const dict = useDictionary();
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const [phone, setPhone] = useState(contacts[0]?.phone ?? "");
  const [outcome, setOutcome] = useState("");
  const [duration, setDuration] = useState(300);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [isPending, startTransition] = useTransition();
  const [lastActivityId, setLastActivityId] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<string | null>(null);
  const [summaryStatus, setSummaryStatus] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadCalls = async () => {
      const res = await fetch("/api/calls");
      if (!res.ok) return;
      const data: ActivityResponse[] = await res.json();
      setLogs(
        data.map((item) => ({
          id: item.id,
          summary: item.summary ?? "",
          durationSec: item.durationSec,
          createdAt: item.createdAt,
          recordingUrl: item.recordingUrl,
          aiSummary: item.aiSummary,
        })),
      );
      setLastActivityId(data[0]?.id ?? null);
    };
    loadCalls();
  }, []);

  const handleContactChange = (value: string) => {
    setContactId(value);
    const selected = contacts.find((item) => item.id === value);
    setPhone(selected?.phone ?? "");
  };

  const registerCall = () => {
    startTransition(async () => {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          phone,
          outcome,
          durationSec: duration,
          leadId: defaultLeadId,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLogs((prev) => [
        {
          id: data.activity.id,
          summary: data.activity.summary,
          durationSec: data.activity.durationSec,
          createdAt: data.activity.createdAt,
          recordingUrl: data.activity.recordingUrl,
          aiSummary: data.activity.aiSummary,
        },
        ...prev,
      ]);
      setLastActivityId(data.activity.id);
      setOutcome("");
    });
  };

  const createRecording = () => {
    startTransition(async () => {
      if (!contactId) return;
      setRecordingStatus(null);
      const res = await fetch("/api/calls/recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, leadId: defaultLeadId }),
      });
      const body = await res.json();
      if (!res.ok) {
        setRecordingStatus(body.message ?? dict.errors.default);
        return;
      }
      setRecordingStatus(dict.calls.recordingReady);
      setLogs((prev) =>
        prev.map((item) => (item.id === body.activity.id ? { ...item, recordingUrl: body.activity.recordingUrl } : item)),
      );
      setLastActivityId(body.activity.id);
    });
  };

  const generateSummary = () => {
    const activityToSummarize = lastActivityId ?? logs[0]?.id;
    if (!activityToSummarize) return;
    startTransition(async () => {
      setSummaryStatus(null);
      const res = await fetch("/api/calls/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: activityToSummarize }),
      });
      const body = await res.json();
      if (!res.ok) {
        setSummaryStatus(body.message ?? dict.errors.default);
        return;
      }
      setSummaryStatus(dict.calls.summaryReady);
      setLogs((prev) =>
        prev.map((item) => (item.id === body.activity.id ? { ...item, aiSummary: body.activity.aiSummary } : item)),
      );
    });
  };

  const assistCall = () => {
    startTransition(async () => {
      setAiStatus(null);
      setAiSuggestion(null);
      if (!contactId) {
        setAiStatus("Selecciona un contacto");
        return;
      }
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: "contact", entityId: contactId, prompt: "Guión breve para esta llamada" }),
      });
      const body = await res.json();
      if (!res.ok) {
        setAiStatus(body.message ?? "Error");
        return;
      }
      setAiStatus("OK");
      setAiSuggestion(body.suggestion ?? "");
    });
  };

  return (
    <Card subtitle={dict.modules.calls.title} title={dict.modules.calls.description}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 text-sm">
          <label className="block text-xs font-semibold uppercase tracking-widest text-current/60">
            {dict.messaging.recipient}
            <select
              className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2"
              value={contactId}
              onChange={(event) => handleContactChange(event.target.value)}
            >
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-widest text-current/60">
            Teléfono
            <input
              className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2"
              value={phone ?? ""}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-widest text-current/60">
            {dict.calls.notes}
            <textarea
              className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent px-3 py-3"
              rows={3}
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-widest text-current/60">
            Duración (segundos)
            <input
              type="number"
              className="mt-1 w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white"
              type="button"
            >
              {dict.calls.clickToCall}
            </button>
            <button
              className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold"
              type="button"
              onClick={registerCall}
              disabled={isPending}
            >
              {isPending ? dict.calls.saving : dict.calls.logManually}
            </button>
            <button
              className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold"
              type="button"
              onClick={createRecording}
              disabled={isPending}
            >
              {dict.calls.recordingCta}
            </button>
            <button
              className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold"
              type="button"
              onClick={generateSummary}
              disabled={isPending || logs.length === 0}
            >
              {dict.calls.summaryCta}
            </button>
            <button
              className="flex items-center gap-2 rounded-2xl border border-emerald-300/50 px-4 py-3 text-sm font-semibold text-emerald-100"
              type="button"
              onClick={assistCall}
              disabled={isPending}
            >
              <SparklesIcon className="h-4 w-4" />
              AI Script
            </button>
          </div>
          {recordingStatus ? <p className="text-xs text-current/70">{recordingStatus}</p> : null}
          {summaryStatus ? <p className="text-xs text-current/70">{summaryStatus}</p> : null}
          {aiStatus ? <p className="text-xs text-current/70">{aiStatus}</p> : null}
          {aiSuggestion ? <p className="text-xs text-current/70 whitespace-pre-line">{aiSuggestion}</p> : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">Registro</p>
          <ul className="mt-4 space-y-3 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="rounded-2xl border border-white/10 p-3">
                <p className="font-semibold">{log.summary}</p>
                <p className="text-xs text-current/60">
                  {log.durationSec ? `${log.durationSec}s · ` : ""}
                  {new Date(log.createdAt).toLocaleString()}
                </p>
                {log.recordingUrl ? (
                  <p className="text-xs text-emerald-300">
                    {dict.calls.recordingLabel}: {log.recordingUrl}
                  </p>
                ) : null}
                {log.aiSummary ? <p className="mt-2 text-sm text-current/80">{log.aiSummary}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
