## Product Requirements Document: StudyShare Platform

**1. Overview**

StudyShare is a simple full-stack web application designed for students to easily share, discover, and discuss study materials. It aims to foster a collaborative learning environment using a modern tech stack.

**2. Goals**

*   Provide a centralized platform for students to upload and access study notes, summaries, and other relevant materials.
*   Enable interaction through comments and likes on shared materials.
*   Allow users to follow others to stay updated on their contributions.
*   Offer a clean, intuitive user experience.
*   Utilize Remix for the frontend and Supabase for the backend, leveraging its BaaS features (Auth, Database, Storage).

**3. Target Audience**

*   University/College Students

**4. Technical Stack**

*   **Frontend:** Remix
*   **Backend:** Supabase (Database, Auth, Storage)
*   **Authentication:** Google OAuth (exclusive)

**5. Features**

| Feature ID | Feature Name          | Description                                                                                                | Priority |
| :--------- | :-------------------- | :--------------------------------------------------------------------------------------------------------- | :------- |
| F01        | User Authentication   | Users can sign up and log in exclusively using their Google account via Supabase Auth.                     | High     |
| F02        | User Profile          | Each user has a simple profile displaying their name, profile picture (from Google), and materials shared. | High     |
| F03        | Material Upload       | Authenticated users can upload study materials (e.g., PDF, images, plain text notes). Use Supabase Storage.  | High     |
| F04        | Material Feed/View    | A main feed displays recently uploaded materials. Users can click to view a specific material's details.   | High     |
| F05        | Commenting            | Authenticated users can post comments on study materials.                                                  | High     |
| F06        | Liking                | Authenticated users can 'like' study materials. Display like counts.                                       | Medium   |
| F07        | Following             | Authenticated users can 'follow' other users.                                                              | Medium   |
| F08        | Personalized Feed     | (Optional Stretch Goal) The main feed could prioritize materials from followed users.                      | Low      |
| F09        | Material Search/Filter | (Optional Stretch Goal) Basic search functionality for materials based on title or description.            | Low      |

**6. Data Models (Conceptual - Supabase Tables)**

*   `profiles`: Stores user information linked to Supabase `auth.users` (id, name, avatar\_url).
*   `materials`: Stores uploaded material metadata (id, user\_id, title, description, file\_url, type, created\_at).
*   `comments`: Stores comments on materials (id, user\_id, material\_id, content, created\_at).
*   `likes`: Tracks likes (user\_id, material\_id, created\_at) - composite primary key.
*   `follows`: Tracks follow relationships (follower\_id, following\_id, created\_at) - composite primary key.

**7. Non-Functional Requirements**

*   **Usability:** Simple and intuitive interface.
*   **Performance:** Reasonably fast load times for feed and material viewing.
*   **Security:** Rely on Supabase for secure authentication and row-level security (RLS) for data access control.

**8. Design Considerations**

*   Minimalist UI.
*   Clear distinction between different types of content (material details, comments).
*   Responsive design for basic usability on mobile devices.

***

## Development Checklist

*   [ ] Setup Remix Project (`npx create-remix@latest`)
*   [ ] Setup Supabase Project (Database, Auth, Storage)
*   [ ] Configure Supabase environment variables in Remix
*   [ ] Implement Google OAuth flow using Supabase Auth helpers for Remix
*   [ ] Create Supabase tables (`profiles`, `materials`, `comments`, `likes`, `follows`)
*   [ ] Implement RLS policies for Supabase tables
*   [ ] Build User Profile page (display basic info)
*   [ ] Implement Material Upload component (using Supabase Storage)
*   [ ] Create backend actions/loaders in Remix for material creation
*   [ ] Build Material Feed page (fetch and display materials)
*   [ ] Build Single Material View page
*   [ ] Implement Commenting functionality (display comments, add new comment form/action)
*   [ ] Implement Liking functionality (like button, update like count, Remix action/loader)
*   [ ] Implement Following functionality (follow button on profiles, Remix action/loader)
*   [ ] (Optional) Enhance feed logic for followed users
*   [ ] Basic CSS Styling/UI implementation

