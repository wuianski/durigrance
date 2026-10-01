"use client";

import { useActionState } from "react";
import { register, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction} className="edition-form">
      <input type="hidden" name="token" value={token} />
      <input
        name="name"
        required
        maxLength={100}
        placeholder="My Name"
        autoComplete="name"
      />
      <input
        name="email"
        type="email"
        required
        maxLength={200}
        placeholder="Email address"
        autoComplete="email"
      />
      {state.error && <p className="edition-error">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Creating…" : "CREATE MY CERTIFICATE"}
      </button>
    </form>
  );
}
