import { redirect, json, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { createClient } from "~/utils/supabase.server";
import { requireAuth } from "~/utils/auth.server";

type ActionData = {
  error?: string;
  success?: boolean;
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAuth(request);
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const session = await requireAuth(request);
  const { supabase } = createClient(request);

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const type = formData.get("type") as string;
  const file = formData.get("file") as File;

  if (!title || !type || !file) {
    return json<ActionData>({ 
      error: "Title, type and file are required" 
    });
  }

  try {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create material record in database
    const { error: dbError } = await supabase.from('materials').insert({
      user_id: session.user.id,
      title,
      description,
      type,
      file_url: fileData.path,
    });

    if (dbError) throw dbError;

    return redirect("/profile");
  } catch (error) {
    return json<ActionData>({ 
      error: "Failed to upload material. Please try again." 
    });
  }
};

export default function NewMaterial() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="md:grid md:gap-6">
        <div className="mt-5 md:mt-0">
          <Form method="post" encType="multipart/form-data">
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select a type</option>
                    <option value="notes">Study Notes</option>
                    <option value="summary">Summary</option>
                    <option value="presentation">Presentation</option>
                    <option value="assignment">Assignment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">File</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file"
                            name="file"
                            type="file"
                            className="sr-only"
                            required
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, PPT, PPTX up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {actionData?.error && (
                <div className="px-4 py-3 bg-red-50">
                  <p className="text-sm text-red-500">{actionData.error}</p>
                </div>
              )}

              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Upload Material
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}