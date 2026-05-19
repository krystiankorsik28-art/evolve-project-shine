import { createServerFn } from '@tanstack/start';
import { getWebRequest, getWebResponse } from '@tanstack/start/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseKey, supabaseUrl } from './client';

export const authAttacher = createServerFn({ method: 'GET' }, async () => {
  const request = getWebRequest();
  const response = getWebResponse();

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.headers.get('cookie') ?? '';
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.headers.append('Set-Cookie', `${name}=${value}; ${options?.path ?? '/'}`);
        });
      },
    },
  });

  return supabase;
});
