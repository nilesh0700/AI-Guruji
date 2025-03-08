# Supabase Setup Guide for AI Guruji

This guide will help you set up Supabase for authentication in the AI Guruji application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name and password for your project
4. Wait for the project to be created

## 2. Configure Authentication

### Email/Password Authentication

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Ensure **Email** provider is enabled
3. Configure settings as needed (e.g., confirm emails, secure email change)

### Google OAuth

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** and click the toggle to enable it
3. Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/):
   - Create a new project (if needed)
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Set Application Type to **Web application**
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (for local development)
4. Copy the **Client ID** and **Client Secret** from Google
5. Paste them into the Supabase Google provider settings
6. Save changes

## 3. Set Up Environment Variables

Create a `.env` file in your project root with the following variables:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. User Profiles (Optional)

If you want to store additional user data:

1. Create a `profiles` table in your Supabase database:
   ```sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
     PRIMARY KEY (id)
   );

   -- Create a secure RLS policy
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can view their own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update their own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   -- Create a trigger to create a profile when a user signs up
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.profiles (id, name, avatar_url)
     VALUES (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
     RETURN new;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
   ```

2. This will automatically create a profile entry when a user signs up

## 5. Testing

1. Run your application locally
2. Test both email/password registration and Google OAuth
3. Verify that users can log in and out successfully
4. Check that protected routes are only accessible to authenticated users

You can find these values in your Supabase dashboard under **Project Settings** > **API**. 