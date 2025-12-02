"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type ContactRecord = {
  id: string;
  name: string;
  title?: string | null;
  phone?: string | null;
  email: string;
  messages: Array<{
    id: string;
    body: string;
    sentAt: string;
  }>;
};

type Props = {
  contacts: ContactRecord[];
};

export const ContactMessagingWorkspace = ({ contacts }: Props) => {
  const dict = useDictionary();
  const [selectedId, setSelectedId] = useState(contacts[0]?.id ?? "");
  const [threads, setThreads] = useState(contacts);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sendError, setSendError] = useState<string | null>(null);

  const selectedContact = useMemo(
    () => threads.find((contact) => contact.id === selectedId),
    [threads, selectedId],
  );

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    startTransition(async () => {
      const res = await fetch(`/api/messaging/whatsapp?contactId=${selectedId}`, {
        signal: controller.signal,
      });
      if (!res.ok) return;
      type ApiMessage = { id: string; body: string; sentAt: string };
      const payload: ApiMessage[] = await res.json();
      const data: ContactRecord["messages"] = payload.map((message) => ({
        id: message.id,
        body: message.body,
        sentAt: message.sentAt,
      }));
      setThreads((prev) =>
        prev.map((contact) => (contact.id === selectedId ? { ...contact, messages: data } : contact)),
      );
    });
    return () => controller.abort();
  }, [selectedId]);

  const handleSend = () => {
    if (!selectedContact?.id || !selectedContact.phone || !message.trim()) return;
    const payload = {
      contactId: selectedContact.id,
      phone: selectedContact.phone,
      message,
    };
    setSendError(null);
    startTransition(async () => {
      const res = await fetch("/api/messaging/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.message === "WHATSAPP_PROVIDER_MISSING") {
          setSendError(dict.errors.whatsappConfigMissing);
        } else {
          setSendError(data.details ?? dict.errors.whatsappSendFailed);
        }
        return;
      }

      setMessage("");
      const { record } = await res.json();
      setThreads((prev) =>
        prev.map((contact) =>
          contact.id === selectedContact.id
            ? {
                ...contact,
                messages: [{ id: record.id, body: record.body, sentAt: record.sentAt }, ...contact.messages],
              }
            : contact,
        ),
      );
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Card subtitle="WhatsApp" title={dict.messaging.contactList}>
        <div className="flex flex-col gap-2">
          {threads.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => setSelectedId(contact.id)}
              className={`rounded-2xl px-4 py-3 text-left transition ${
                contact.id === selectedId ? "bg-white/10 text-white" : "text-current/70 hover:bg-white/5"
              }`}
            >
              <p className="font-semibold">{contact.name}</p>
              <p className="text-xs text-current/60">{contact.phone ?? dict.messaging.noPhone}</p>
            </button>
          ))}
        </div>
      </Card>
      <Card subtitle={dict.modules.messaging.title} title={selectedContact?.name ?? ""}>
        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold uppercase tracking-[0.4em] text-current/60">
            {dict.messaging.channelLabel}
            <textarea
              className="mt-2 w-full rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none"
              rows={3}
              placeholder={dict.messaging.placeholder}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={!selectedContact?.phone}
            />
          </label>
          <button
            type="button"
            disabled={!message.trim() || isPending || !selectedContact?.phone}
            onClick={handleSend}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
          >
            {isPending ? dict.messaging.sending : dict.messaging.send}
          </button>
          {sendError ? (
            <div className="rounded-2xl border border-rose-500/60 bg-rose-500/15 px-4 py-2 text-xs text-rose-100">
              {sendError}
            </div>
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-current/60">{dict.messaging.historyTitle}</p>
            <div className="mt-3 flex max-h-[320px] flex-col gap-3 overflow-y-auto">
              {selectedContact?.messages.length ? (
                selectedContact.messages.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 px-3 py-2 text-sm">
                    <p className="text-current/80">{item.body}</p>
                    <p className="text-xs text-current/60">{new Date(item.sentAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-current/60">{dict.messaging.noMessages}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
