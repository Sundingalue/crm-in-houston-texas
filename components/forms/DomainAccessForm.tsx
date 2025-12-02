"use client";

import { useDictionary } from "../providers/LanguageProvider";

export const DomainAccessForm = () => {
  const dict = useDictionary();

  return (
    <form className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 shadow-inner">
      <p className="text-sm text-current/70">{dict.common.domainForm.description}</p>
      <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-current/70">
        {dict.common.domainForm.domainLabel}
        <input
          className="mt-2 w-full rounded-2xl border border-white/30 bg-transparent px-4 py-3 text-base focus:border-white focus:outline-none"
          placeholder={dict.common.domainForm.domainPlaceholder}
          type="text"
          name="domain"
          required
        />
      </label>
      <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-current/70">
        {dict.common.domainForm.userLabel}
        <input
          className="mt-2 w-full rounded-2xl border border-white/30 bg-transparent px-4 py-3"
          placeholder={dict.common.domainForm.userPlaceholder}
          type="email"
          name="username"
          required
        />
      </label>
      <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-current/70">
        {dict.common.domainForm.passwordLabel}
        <input
          className="mt-2 w-full rounded-2xl border border-white/30 bg-transparent px-4 py-3"
          placeholder={dict.common.domainForm.passwordPlaceholder}
          type="password"
          name="password"
          required
        />
      </label>
      <button
        type="button"
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-emerald-500/30"
      >
        {dict.common.domainForm.cta}
      </button>
      <p className="mt-3 text-xs text-current/70">{dict.common.domainForm.helper}</p>
    </form>
  );
};
