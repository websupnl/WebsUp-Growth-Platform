"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await signIn(password);
  if (!ok) {
    redirect("/login?error=1");
  }
  redirect("/");
}
