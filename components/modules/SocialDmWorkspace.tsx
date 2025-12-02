"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type ContactOption = {
  id: string;
  name: string;
  email?: string | null;
};

type MessageHistory = {
  id: string;
  body: string;
  sentAt: string;
  metadata?: { handle?: string; platform?: string };
};

export const SocialDmWorkspace = ({ contacts }: { contacts: ContactOption[] }) => {
  const dict = useDictionary();
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "facebook">("instagram");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<MessageHistory[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      const qs = contactId ? `?contactId=${contactId}` : "";
      const res = await fetch(`/api/messaging/social${qs}`);
      if (!res.ok) return;
      setHistory(await res.json());
    };
    loadHistory();
  }, [contactId]);

  const handleContactChange = (id: string) => {
    setContactId(id);
    const contact = contacts.find((c) => c.id === id);
    if (contact?.email) {
      setHandle(contact.email.split("@")[0] ?? "");
    }
  };

  const send = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/messaging/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, handle, platform, message }),
      });
      if (!res.ok) {
        const body = await res.json();
        setStatus(body.message ?? "Error");
        return;
      }
      const data = await res.json();
      setHistory((prev) => [{ ...data.record, sentAt: data.record.sentAt }, ...prev]);
      setMessage("");
      setStatus("OK");
    });
  };

  return (
    <Card subtitle={dict.social.subtitle} title={dict.social.title} badge="Meta API ready">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 text-sm">
          <label className="block text-xs font-semibold uppercase tracking-widest text-current/60">
            {dict.messaging.recipient}
            <select
              className="mt-1 w-full rounded-2xl border border-white/30 bg-transparent px-3 py-2"
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
            {dict.social.handle}
            <input
              className="mt-1 w-full rounded-2xl border border-white/30 bg-transparent px-3 py-2"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="@usuario"
            />
          </label>
          <div className="flex gap-3">
            {["instagram", "facebook"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPlatform(option as "instagram" | "facebook")}
                className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-semibold ${
                  platform === option ? "border-emerald-300 bg-emerald-200/20 text-white" : "border-white/20"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-current/60">
            {dict.messaging.message}
            <textarea
              className="mt-1 w-full rounded-2xl border border-white/30 bg-transparent px-3 py-3"
              rows={4}
              placeholder={dict.social.placeholder}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={send}
            disabled={isPending || !message || !handle}
            className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-400 to-sky-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? dict.messaging.sending : dict.social.send}
          </button>
          {status ? (
            <p className="text-xs text-current/70">
              {status === "OK" ? dict.social.sent : dict.errors.default} ({status})
            </p>
          ) : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">{dict.social.history}</p>
          <input
            className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2 text-xs"
            placeholder="Filtra por texto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <ul className="mt-4 space-y-3 text-sm">
            {history
              .filter((h) => (filter ? h.body.toLowerCase().includes(filter.toLowerCase()) : true))
              .map((item) => (
                <li key={item.id} className="rounded-2xl border border-white/10 p-3">
                  <p className="text-xs uppercase tracking-widest text-current/60">
                    {item.metadata?.platform ?? "Meta"} · {item.metadata?.handle ?? "handle"}
                  </p>
                  <p>{item.body}</p>
                  <p className="text-xs text-current/60">{new Date(item.sentAt).toLocaleString()}</p>
                </li>
              ))}
            {history.length === 0 ? <p className="text-xs text-current/60">Sin mensajes aún.</p> : null}
          </ul>
        </div>
      </div>
    </Card>
  );
};
