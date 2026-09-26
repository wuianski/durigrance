"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  adminCookieValue,
  isAdminAuthed,
  safeEqual,
} from "@/lib/adminAuth";
import { adminResetUser, adminUpdateUser, getUserByNumber } from "@/lib/db";

export type LoginState = { error?: string };

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  const signed = adminCookieValue();
  if (!expected || !signed) {
    return { error: "ADMIN_PASSWORD is not configured on the server." };
  }
  if (!safeEqual(password, expected)) {
    return { error: "Wrong password." };
  }
  (await cookies()).set(ADMIN_COOKIE, signed, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/admin");
  return {};
}

export async function logout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}

function revalidateUser(userNumber: string) {
  revalidatePath("/admin");
  const user = getUserByNumber(userNumber);
  if (user) {
    revalidatePath(`/u/${user.token}`);
    revalidatePath(`/q/${user.token}`);
  }
}

export async function saveUser(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) return;
  const userNumber = String(formData.get("user_number") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!userNumber) return;
  if (name && email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    adminUpdateUser(userNumber, name, email);
  }
  revalidateUser(userNumber);
}

export async function resetUser(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) return;
  const userNumber = String(formData.get("user_number") ?? "");
  if (!userNumber) return;
  adminResetUser(userNumber);
  revalidateUser(userNumber);
}
