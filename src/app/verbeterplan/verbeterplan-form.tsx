"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { submitVerbeterplan } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#a78bfa] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Aanvraag wordt verstuurd..." : "Stuur mijn verbeterplan aan"}
    </button>
  );
}

export function VerbeterplanForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <p className="text-lg font-semibold text-white">Aanvraag ontvangen.</p>
        <p className="mt-2 text-[#9b93ad]">
          Je ontvangt binnen 48 uur een persoonlijk verbeterplan van Daan.
        </p>
      </div>
    );
  }

  return (
    <form
      action={async (fd) => {
        setError("");
        const result = await submitVerbeterplan(fd);
        if (result.ok) {
          setDone(true);
        } else {
          setError(result.error);
        }
      }}
      className="grid gap-4"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#9b93ad]">
          Website URL
        </label>
        <input
          name="url"
          type="text"
          placeholder="https://jouwebsite.nl"
          required
          className="h-11 w-full rounded-xl border border-[#241c34] bg-[#0d0a16] px-4 text-white placeholder:text-[#9b93ad]/50 focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/60"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#9b93ad]">
          Je naam
        </label>
        <input
          name="name"
          type="text"
          placeholder="Jan de Vries"
          className="h-11 w-full rounded-xl border border-[#241c34] bg-[#0d0a16] px-4 text-white placeholder:text-[#9b93ad]/50 focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/60"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#9b93ad]">
          E-mailadres
        </label>
        <input
          name="email"
          type="email"
          placeholder="jan@jouwebsite.nl"
          required
          className="h-11 w-full rounded-xl border border-[#241c34] bg-[#0d0a16] px-4 text-white placeholder:text-[#9b93ad]/50 focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/60"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <SubmitButton />
    </form>
  );
}
