"use server";

import { revalidatePath } from "next/cache";
import { getUserByToken, registerUser } from "@/lib/db";

export type RegisterState = { error?: string };

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const token = String(formData.get("token") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  const user = getUserByToken(token);
  if (!user) {
    return { error: "This link is not valid." };
  }

  // Already registered (e.g. double submit): just refresh to the welcome view.
  if (user.name) {
    revalidatePath(`/u/${token}`);
    return {};
  }

  if (!name) {
    return { error: "Please enter your name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  registerUser(token, name, email);
  revalidatePath(`/u/${token}`);
  return {};
}
