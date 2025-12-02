"use client";

import { useState, useTransition, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type Option = { value: string; label: string };

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2 text-sm ${props.className ?? ""}`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`w-full rounded-2xl border border-white/20 bg-transparent px-3 py-2 text-sm ${props.className ?? ""}`}
  />
);

export function CreateLeadForm({ owners }: { owners?: Option[] }) {
  const dict = useDictionary();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", company: "", source: "", status: "nuevo", ownerId: "" });

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ownerId: form.ownerId || undefined, status: form.status }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.created : body.message ?? dict.errors.default);
      if (res.ok) setForm({ name: "", company: "", source: "", status: "nuevo", ownerId: "" });
    });
  };

  return (
    <Card title={dict.forms.lead.title} subtitle={dict.forms.lead.subtitle}>
      <div className="grid gap-3 text-sm">
        <Input placeholder={dict.forms.lead.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder={dict.forms.lead.company} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        <Input placeholder={dict.forms.lead.source} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
        <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          {["nuevo", "contactado", "calificado", "negociacion", "ganado", "perdido"].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
          <option value="">{dict.forms.optionalOwner}</option>
          {owners?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !form.name || !form.company || !form.source}
          className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
        >
          {isPending ? dict.forms.saving : dict.forms.create}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
    </Card>
  );
}

export function CreateContactForm({ accounts }: { accounts?: Option[] }) {
  const dict = useDictionary();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", title: "", accountId: "" });

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, accountId: form.accountId || undefined, phone: form.phone || undefined, title: form.title || undefined }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.created : body.message ?? dict.errors.default);
      if (res.ok) setForm({ name: "", email: "", phone: "", title: "", accountId: "" });
    });
  };

  return (
    <Card title={dict.forms.contact.title} subtitle={dict.forms.contact.subtitle}>
      <div className="grid gap-3 text-sm">
        <Input placeholder={dict.forms.contact.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="email@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input placeholder={dict.forms.contact.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input placeholder={dict.forms.contact.title} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
          <option value="">{dict.forms.optionalAccount}</option>
          {accounts?.map((acc) => (
            <option key={acc.value} value={acc.value}>
              {acc.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !form.name || !form.email}
          className="rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? dict.forms.saving : dict.forms.create}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
    </Card>
  );
}

export function CreateAccountForm() {
  const dict = useDictionary();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", industry: "", size: "pyme" });

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/crm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, industry: form.industry || undefined }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.created : body.message ?? dict.errors.default);
      if (res.ok) setForm({ name: "", industry: "", size: "pyme" });
    });
  };

  return (
    <Card title={dict.forms.account.title} subtitle={dict.forms.account.subtitle}>
      <div className="grid gap-3 text-sm">
        <Input placeholder={dict.forms.account.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder={dict.forms.account.industry} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        <Select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
          <option value="startup">startup</option>
          <option value="pyme">pyme</option>
          <option value="enterprise">enterprise</option>
        </Select>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !form.name}
          className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
        >
          {isPending ? dict.forms.saving : dict.forms.create}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
    </Card>
  );
}

export function CreateDealForm({ accounts, leads, stages }: { accounts?: Option[]; leads?: Option[]; stages?: Option[] }) {
  const dict = useDictionary();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", value: 10000, stage: "descubrimiento", accountId: "", leadId: "" });

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: Number(form.value),
          accountId: form.accountId || undefined,
          leadId: form.leadId || undefined,
        }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.created : body.message ?? dict.errors.default);
      if (res.ok) setForm({ name: "", value: 10000, stage: "descubrimiento", accountId: "", leadId: "" });
    });
  };

  return (
    <Card title={dict.forms.deal.title} subtitle={dict.forms.deal.subtitle}>
      <div className="grid gap-3 text-sm">
        <Input placeholder={dict.forms.deal.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input type="number" placeholder="Valor" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        <Select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
          {(stages?.length
            ? stages
            : [
                { value: "descubrimiento", label: "descubrimiento" },
                { value: "calificacion", label: "calificacion" },
                { value: "propuesta", label: "propuesta" },
                { value: "negociacion", label: "negociacion" },
                { value: "cierre", label: "cierre" },
                { value: "ganado", label: "ganado" },
                { value: "perdido", label: "perdido" },
              ]
          ).map((stage) => (
            <option key={stage.value} value={stage.value}>
              {stage.label}
            </option>
          ))}
        </Select>
        <Select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
          <option value="">{dict.forms.optionalAccount}</option>
          {accounts?.map((acc) => (
            <option key={acc.value} value={acc.value}>
              {acc.label}
            </option>
          ))}
        </Select>
        <Select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })}>
          <option value="">{dict.forms.optionalLead}</option>
          {leads?.map((lead) => (
            <option key={lead.value} value={lead.value}>
              {lead.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !form.name}
          className="rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? dict.forms.saving : dict.forms.create}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
    </Card>
  );
}

export function CreateCampaignForm() {
  const dict = useDictionary();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", channel: "email", status: "borrador" });

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.created : body.message ?? dict.errors.default);
      if (res.ok) setForm({ name: "", subject: "", channel: "email", status: "borrador" });
    });
  };

  return (
    <Card title={dict.forms.campaign.title} subtitle={dict.forms.campaign.subtitle}>
      <div className="grid gap-3 text-sm">
        <Input placeholder={dict.forms.campaign.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder={dict.forms.campaign.subject} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
          <option value="email">email</option>
          <option value="whatsapp">whatsapp</option>
          <option value="outbound">outbound</option>
        </Select>
        <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="borrador">borrador</option>
          <option value="activo">activo</option>
          <option value="pausa">pausa</option>
          <option value="completado">completado</option>
        </Select>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !form.name || !form.subject}
          className="rounded-2xl bg-gradient-to-r from-pink-400 to-rose-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? dict.forms.saving : dict.forms.create}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
    </Card>
  );
}

export function InviteUserForm() {
  const dict = useDictionary();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [roles, setRoles] = useState<Option[]>([]);
  const [form, setForm] = useState({ name: "", email: "", roleId: "" });

  useEffect(() => {
    const loadRoles = async () => {
      const res = await fetch("/api/roles");
      if (!res.ok) return;
      const data = await res.json();
      setRoles(data.map((r: { id: string; name: string }) => ({ value: r.id, label: r.name })));
    };
    loadRoles().catch(() => {});
  }, []);

  const submit = () => {
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const body = await res.json();
      setStatus(res.ok ? dict.forms.created : body.message ?? dict.errors.default);
      if (res.ok) setForm({ name: "", email: "", roleId: "" });
    });
  };

  return (
    <Card title={dict.forms.user.title} subtitle={dict.forms.user.subtitle}>
      <div className="grid gap-3 text-sm">
        <Input placeholder={dict.forms.user.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="email@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
          <option value="">Select role</option>
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={submit}
          disabled={isPending || !form.name || !form.email}
          className="rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-900 disabled:opacity-50"
        >
          {isPending ? dict.forms.saving : dict.forms.invite}
        </button>
        {status ? <p className="text-xs text-current/70">{status}</p> : null}
      </div>
    </Card>
  );
}
