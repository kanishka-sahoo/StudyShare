import { type ActionFunction, redirect } from "@remix-run/node";
import { createClient } from "~/utils/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  const { supabase, response } = createClient(request);
  await supabase.auth.signOut();
  return redirect("/", {
    headers: response.headers,
  });
};