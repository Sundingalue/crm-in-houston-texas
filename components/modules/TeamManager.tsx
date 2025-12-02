"use client";

import { Card } from "@/components/ui/Card";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export const TeamManager = ({ users }: { users: UserItem[] }) => {
  return (
    <Card subtitle="Usuarios" title="Roles y accesos">
      <div className="space-y-3 text-sm">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded-2xl border border-white/15 px-4 py-3">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-current/70">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-current/70">
                {user.role}
              </span>
              <span className={`text-xs uppercase tracking-widest ${user.active ? "text-emerald-300" : "text-rose-300"}`}>
                {user.active ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Invitar usuario
        </button>
      </div>
    </Card>
  );
};
