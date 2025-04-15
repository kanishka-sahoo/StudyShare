import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createClient } from "~/utils/supabase.server";
import { requireAuth } from "~/utils/auth.server";

type Material = {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
  _count: {
    likes: number;
    comments: number;
  };
};

type LoaderData = {
  profile: {
    id: string;
    name: string;
    avatar_url: string;
  };
  materials: Material[];
  followerCount: number;
  followingCount: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await requireAuth(request);
  const { supabase } = createClient(request);
  
  const userId = session.user.id;

  const [
    { data: profile },
    { data: materials },
    { count: followerCount },
    { count: followingCount }
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("materials")
      .select("*, likes(count), comments(count)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("follows").select("*", { count: "exact" }).eq("following_id", userId),
    supabase.from("follows").select("*", { count: "exact" }).eq("follower_id", userId)
  ]);

  return json({ 
    profile,
    materials,
    followerCount,
    followingCount
  });
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Profile() {
  const { profile, materials, followerCount, followingCount } = useLoaderData<LoaderData>();

  return (
    <div>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-5">
            <div className="flex-shrink-0">
              <img
                className="h-16 w-16 rounded-full"
                src={profile.avatar_url || "/default-avatar.png"}
                alt=""
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <div className="mt-1 flex items-center space-x-6">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-500">
                    {materials?.length || 0}
                  </span>
                  <span className="text-sm text-gray-500">materials</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-500">
                    {followerCount || 0}
                  </span>
                  <span className="text-sm text-gray-500">followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium text-gray-500">
                    {followingCount || 0}
                  </span>
                  <span className="text-sm text-gray-500">following</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {materials?.map((material) => (
              <li key={material.id}>
                <a href={`/materials/${material.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {material.title}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          {material.description}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {material.type}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex sm:space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                          </svg>
                          {material._count.likes} likes
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.232 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                          </svg>
                          {material._count.comments} comments
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                        </svg>
                        {formatDate(material.created_at)}
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}