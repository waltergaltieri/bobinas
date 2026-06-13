"use server";

import { redirect } from "next/navigation";

import { loginSchema } from "@/lib/validations/catalog";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Revisá el email y la contraseña." };
  }

  if (!hasSupabaseEnv()) {
    return { error: "Faltan las variables de entorno de Supabase." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "No pudimos iniciar sesión con esos datos." };
  }

  const profile = await getCurrentProfile();

  if (profile?.role === "ADMIN") {
    redirect("/admin");
  }

  redirect("/productos");
}

export async function logoutAction() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
