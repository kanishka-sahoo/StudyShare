import { json, redirect, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { createClient } from "~/utils/supabase.server";
import { getSession } from "~/utils/auth.server";

type LoaderData = {
  material: {
    id: string;
    title: string;
    description: string;
    file_url: string;
    type: string;
    created_at: string;
    profiles: {
      id: string;
      name: string;
      avatar_url: string;
    };
  };
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    profiles: {
      name: string;
      avatar_url: string;
    };
  }>;
  likes: number;
  isLiked: boolean;
  session: any;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request);
  const { supabase } = createClient(request);
  
  const [materialResponse, commentsResponse, likesResponse, isLikedResponse] = await Promise.all([
    supabase
      .from("materials")
      .select(`
        *,
        profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq("id", params.id)
      .single(),
    supabase
      .from("comments")
      .select(`
        *,
        profiles (
          name,
          avatar_url
        )
      `)
      .eq("material_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("likes")
      .select("*", { count: "exact" })
      .eq("material_id", params.id),
    session
      ? supabase
          .from("likes")
          .select("*")
          .eq("material_id", params.id)
          .eq("user_id", session.user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!materialResponse.data) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({
    material: materialResponse.data,
    comments: commentsResponse.data || [],
    likes: likesResponse.count || 0,
    isLiked: !!isLikedResponse.data,
    session,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request);
  if (!session) {
    const url = new URL(request.url);
    throw redirect(`/login?redirectTo=${encodeURIComponent(url.pathname)}`);
  }

  const { supabase } = createClient(request);
  const formData = await request.formData();
  const action = formData.get("_action");

  try {
    if (action === "comment") {
      const content = formData.get("content") as string;
      if (!content) {
        return json({ error: "Comment content is required" });
      }

      const { error } = await supabase.from("comments").insert({
        material_id: params.id,
        user_id: session.user.id,
        content,
      });

      if (error) throw error;
    } else if (action === "toggle-like") {
      const existing = await supabase
        .from("likes")
        .select("*")
        .eq("material_id", params.id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (existing.data) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("material_id", params.id)
          .eq("user_id", session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("likes").insert({
          material_id: params.id,
          user_id: session.user.id,
        });

        if (error) throw error;
      }
    }

    return null;
  } catch (error) {
    return json({ 
      error: "An error occurred. Please try again." 
    });
  }
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MaterialDetail() {
  const { material, comments, likes, isLiked, session } = useLoaderData<LoaderData>();

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {material.title}
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {material.type}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  Posted by {material.profiles.name} on {formatDate(material.created_at)}
                </div>
              </div>
            </div>
            {session && (
              <Form method="post" className="flex items-center space-x-4">
                <input type="hidden" name="_action" value="toggle-like" />
                <button
                  type="submit"
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
                    isLiked
                      ? "bg-pink-100 text-pink-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <svg
                    className={`h-5 w-5 ${isLiked ? "text-pink-500" : "text-gray-400"}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                  </svg>
                  <span>{likes} likes</span>
                </button>
              </Form>
            )}
          </div>

          {material.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">{material.description}</p>
            </div>
          )}

          <div className="mt-6">
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Download Material
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Comments</h3>
          
          {session && (
            <div className="mt-6">
              <Form method="post" className="space-y-4">
                <input type="hidden" name="_action" value="comment" />
                <div>
                  <label htmlFor="content" className="sr-only">
                    Add a comment
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={3}
                    className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Add a comment..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Post Comment
                  </button>
                </div>
              </Form>
            </div>
          )}

          <div className="mt-6 space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={comment.profiles.avatar_url || "/default-avatar.png"}
                    alt=""
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {comment.profiles.name}
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    {comment.content}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-sm text-gray-500">No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}