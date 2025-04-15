-- Enable the necessary extensions
create extension if not exists "uuid-ossp";

-- Create tables
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    name text,
    avatar_url text,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create table public.materials (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    file_url text not null,
    type text not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create table public.comments (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    material_id uuid references public.materials(id) on delete cascade not null,
    content text not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create table public.likes (
    user_id uuid references public.profiles(id) on delete cascade not null,
    material_id uuid references public.materials(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (user_id, material_id)
);

create table public.follows (
    follower_id uuid references public.profiles(id) on delete cascade not null,
    following_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamptz default now() not null,
    primary key (follower_id, following_id)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using (true);

create policy "Users can insert their own profile"
    on profiles for insert
    with check (auth.uid() = id);

create policy "Users can update their own profile"
    on profiles for update
    using (auth.uid() = id);

create policy "Materials are viewable by everyone"
    on materials for select
    using (true);

create policy "Authenticated users can upload materials"
    on materials for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own materials"
    on materials for update
    using (auth.uid() = user_id);

create policy "Users can delete their own materials"
    on materials for delete
    using (auth.uid() = user_id);

create policy "Comments are viewable by everyone"
    on comments for select
    using (true);

create policy "Authenticated users can comment"
    on comments for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own comments"
    on comments for update
    using (auth.uid() = user_id);

create policy "Users can delete their own comments"
    on comments for delete
    using (auth.uid() = user_id);

create policy "Likes are viewable by everyone"
    on likes for select
    using (true);

create policy "Authenticated users can like materials"
    on likes for insert
    with check (auth.uid() = user_id);

create policy "Users can remove their likes"
    on likes for delete
    using (auth.uid() = user_id);

create policy "Follows are viewable by everyone"
    on follows for select
    using (true);

create policy "Authenticated users can follow others"
    on follows for insert
    with check (auth.uid() = follower_id);

create policy "Users can unfollow"
    on follows for delete
    using (auth.uid() = follower_id);

-- Create indexes for better performance
create index materials_user_id_index on materials(user_id);
create index comments_material_id_index on comments(material_id);
create index comments_user_id_index on comments(user_id);
create index likes_material_id_index on likes(material_id);
create index follows_following_id_index on follows(following_id);

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, name, avatar_url)
    values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to create a profile for a new user
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();