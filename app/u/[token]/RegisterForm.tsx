"use client";

import { useActionState } from "react";
import { register, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export default function RegisterForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <label>
        Name
        <input name="name" required maxLength={100} placeholder="Your name" />
      </label>
      <label>
        Email
        <input
          name="email"
          type="email"
          required
          maxLength={200}
          placeholder="you@example.com"
        />
      </label>
      {state.error && <p className="error">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Register"}
      </button>
    </form>
  );
}
