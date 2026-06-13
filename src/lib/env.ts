type EnvSource = Record<string, string | undefined>;

export function readSupabaseBrowserEnv(env: EnvSource = process.env) {
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    key:
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function readServerEnv(env: EnvSource = process.env) {
  return {
    databaseUrl: env.DATABASE_URL,
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey:
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    supabaseServiceRoleKey:
      env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY,
    cloudinaryCloudName: env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: env.CLOUDINARY_API_SECRET,
    siteUrl: env.NEXT_PUBLIC_SITE_URL ?? env.NEXT_PUBLIC_APP_URL,
  };
}

export function hasSupabaseBrowserEnv(env: EnvSource = process.env) {
  const supabase = readSupabaseBrowserEnv(env);
  return Boolean(supabase.url && supabase.key);
}
