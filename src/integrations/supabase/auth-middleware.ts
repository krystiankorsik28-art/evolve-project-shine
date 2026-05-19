import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type LoaderFunctionArgs, redirect } from "react-router";

export async function authMiddleware({ request }: LoaderFunctionArgs) {
  const response = new Response();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get("Cookie") ?? "";
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.headers.append("Set-Cookie", `${name}=${value}; ${options.path || "/"}`)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user, response };
}
