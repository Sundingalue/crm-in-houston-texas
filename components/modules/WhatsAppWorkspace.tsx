"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type ContactOption = {
  id: string;
  name: string;
  phone?: string | null;
};

type MessageHistory = {
  id: string;
  body: string;
  contact?: { id: string; name: string } | null;
  sentAt: string;
  metadata?: { phone?: string; provider?: string };
};

export const WhatsAppWorkspace = ({ contacts }: { contacts: ContactOption[] }) => {
  const dict = useDictionary();
  const [history, setHistory] = useState<MessageHistory[]>([]);
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const [phone, setPhone] = useState(contacts[0]?.phone ?? "");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadHistory = async (id?: string) => {
      const qs = id ? `?contactId=${id}` : "";
      const res = await fetch(`/api/messaging/whatsapp${qs}`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data);
    };
    loadHistory(contactId);
  }, [contactId]);

  const handleContactChange = (id: string) => {
    setContactId(id);
    const contact = contacts.find((item) => item.id === id);
    setPhone(contact?.phone ?? "");
  };

  const handleSend = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/messaging/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, phone, message }),
      });
      if (!res.ok) {
        setStatus(dict.errors.whatsappSendFailed);
        return;
      }
      const data = await res.json();
      setHistory((prev) => [{ ...data.record, sentAt: data.record.sentAt }, ...prev]);
      setMessage("");
      setStatus(dict.messaging.sent ?? "OK");
    });
  };

  return (
    <Card subtitle={dict.modules.messaging.title} title={dict.modules.messaging.description}>
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
        Filtro
        <input
          className="mt-1 w-full rounded-2xl border border-white/30 bg-transparent px-3 py-2"
          placeholder="Busca en mensajes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
          <label className="block text-xs font-semibold uppercase tracking-widest text-current/60">
            Teléfono
            <input
              className="mt-1 w-full rounded-2xl border border-white/30 bg-transparent px-3 py-2"
              value={phone ?? ""}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-widest text-current/60">
            {dict.messaging.message}
            <textarea
              className="mt-1 w-full rounded-2xl border border-white/30 bg-transparent px-3 py-3"
              rows={4}
              placeholder={dict.messaging.placeholder}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={handleSend}
            disabled={isPending || !message}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? "Enviando..." : dict.messaging.send}
          </button>
          {status ? <p className="text-xs text-current/70">{status}</p> : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-current/60">{dict.messaging.historyTitle}</p>
          <ul className="mt-4 space-y-3 text-sm">
            {history
              .filter((item) => (search ? item.body.toLowerCase().includes(search.toLowerCase()) : true))
              .map((item) => (
                <li key={item.id} className="rounded-2xl border border-white/10 p-3">
                  <p className="text-xs uppercase tracking-widest text-current/60">
                    {item.contact?.name ?? "Contacto"} · {item.metadata?.provider ?? "whatsapp"}
                  </p>
                  <p>{item.body}</p>
                  <p className="text-xs text-current/60">{new Date(item.sentAt).toLocaleString()}</p>
                  {item.metadata?.phone ? <p className="text-[11px] text-current/50">{item.metadata.phone}</p> : null}
                </li>
              ))}
            {history.length === 0 ? <p className="text-xs text-current/60">Sin historial para este contacto.</p> : null}
          </ul>
        </div>
      </div>
    </Card>
  );
};
