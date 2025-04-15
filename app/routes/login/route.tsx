import { json, redirect, type ActionFunction } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { createClient } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  const { supabase, response } = createClient(request);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    return json({ error: error.message }, { status: 400 });
  }

  return redirect(data.url, { headers: response.headers });
};

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo-dark.png"
          alt="StudyShare"
        />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          {actionData?.error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
              {actionData.error}
            </div>
          )}
          <form method="post" className="space-y-6">
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg className="mr-2 h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}