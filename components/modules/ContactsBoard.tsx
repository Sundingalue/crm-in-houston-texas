"use client";

import { Card } from "@/components/ui/Card";
import { useDictionary } from "@/components/providers/LanguageProvider";

type ContactItem = {
  id: string;
  name: string;
  title?: string | null;
  email: string;
  phone?: string | null;
  account?: string | null;
};

type Props = {
  contacts: ContactItem[];
};

export const ContactsBoard = ({ contacts }: Props) => {
  const dict = useDictionary();
  return (
    <Card subtitle={dict.modules.contacts.title} title={dict.modules.contacts.description}>
      <div className="overflow-x-auto text-sm">
        <table className="min-w-full">
          <thead className="text-left text-xs uppercase tracking-widest text-current/60">
            <tr>
              <th className="pb-3 pr-4">{dict.navigation.contacts}</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Teléfono</th>
              <th className="pb-3">Cuenta</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-t border-white/10">
                <td className="py-3 pr-4">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-xs text-current/70">{contact.title ?? "—"}</p>
                </td>
                <td className="py-3 pr-4">{contact.email}</td>
                <td className="py-3 pr-4">{contact.phone ?? "—"}</td>
                <td className="py-3">{contact.account ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
