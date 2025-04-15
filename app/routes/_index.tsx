import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createClient } from "~/utils/supabase.server";

type Material = {
  id: string;
  title: string;
  description: string;
  file_url: string;
  type: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string;
  };
  likes: {
    count: number;
  }[];
  comments: {
    count: number;
  }[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const { supabase } = createClient(request);

  const { data: materials } = await supabase
    .from("materials")
    .select(`
      *,
      profiles (
        name,
        avatar_url
      ),
      likes (count),
      comments (count)
    `)
    .order("created_at", { ascending: false });

  return json({ materials });
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "StudyShare - Study Materials" },
    { name: "description", content: "Browse and share study materials with the community" },
  ];
};

export default function Index() {
  const { materials } = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Study Materials</h1>
          <p className="mt-2 text-sm text-gray-700">
            Browse through shared study materials from the community
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {materials?.map((material: Material) => (
            <div
              key={material.id}
              className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-x-4">
                  <img
                    src={material.profiles.avatar_url || "/default-avatar.png"}
                    alt=""
                    className="h-8 w-8 rounded-full bg-gray-100"
                  />
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-gray-900">
                      {material.profiles.name}
                    </p>
                    <p className="text-gray-600">
                      {formatDate(material.created_at)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-1 flex-col">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <a href={`/materials/${material.id}`}>
                      {material.title}
                    </a>
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                    {material.description}
                  </p>
                  <div className="mt-6 flex items-center gap-x-6">
                    <div className="flex items-center gap-x-2">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                      </svg>
                      <span className="text-sm text-gray-500">
                        {material.likes?.[0]?.count || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.232 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zM6.75 6a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 2.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">
                        {material.comments?.[0]?.count || 0}
                      </span>
                    </div>
                    <div className="flex-1 text-right">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {material.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
