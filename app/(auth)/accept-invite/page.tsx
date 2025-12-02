import { Suspense } from "react";
import { AcceptInviteClient } from "./AcceptInviteClient";

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          <p className="text-sm text-white/70">Cargando invitación...</p>
        </div>
      }
    >
      <AcceptInviteClient />
    </Suspense>
  );
}
