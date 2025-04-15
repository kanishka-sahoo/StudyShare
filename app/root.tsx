import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Form,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { createClient } from "./utils/supabase.server";
import { useState } from "react";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

declare global {
  interface Window {
    env: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const { supabase, response } = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json(
    {
      session,
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
      },
    },
    {
      headers: response.headers,
    }
  );
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  const { session } = useLoaderData<typeof loader>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo-dark.png"
                alt="StudyShare"
              />
              <span className="ml-2 text-xl font-semibold">StudyShare</span>
            </a>
          </div>
          <div className="ml-10 space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <a
                  href="/materials/new"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Upload Material
                </a>
                <div className="relative">
                  <button
                    type="button"
                    className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.user_metadata.avatar_url || "/default-avatar.png"}
                      alt=""
                    />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </a>
                      <Form action="/logout" method="post">
                        <button
                          type="submit"
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </Form>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <a
                href="/login"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default function App() {
  const { env } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-full">
      <script
        dangerouslySetInnerHTML={{
          __html: `window.env = ${JSON.stringify(env)}`,
        }}
      />
      <Header />
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
