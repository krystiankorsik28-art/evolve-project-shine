// Ambient module shims for scaffolded files we don't actually use in this Vite + React Router project.
declare module '@tanstack/start' {
  export const createServerFn: any;
}
declare module '@tanstack/start/server' {
  export const getWebRequest: any;
  export const getWebResponse: any;
}
declare module '@tanstack/react-start' {
  export const createServerFn: any;
  export const createMiddleware: any;
}
declare module '@tanstack/react-start/server' {
  export const getWebRequest: any;
  export const getWebResponse: any;
}
declare module '@supabase/ssr' {
  export const createServerClient: any;
  export const createBrowserClient: any;
  export type CookieOptions = any;
}
declare module 'next/headers' {
  export const cookies: any;
  export const headers: any;
}
