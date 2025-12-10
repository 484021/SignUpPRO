# Google OAuth Setup Guide

Follow these steps to enable Google authentication in your EventSignup app.

## 1. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** > **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Configure OAuth Consent Screen:
   - Go to **APIs & Services** > **OAuth consent screen**
   - Choose **External** user type (or Internal if using Google Workspace)
   - Fill in required fields:
     - App name: "EventSignup"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

5. Create OAuth 2.0 Credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth 2.0 Client ID**
   - Select **Web application**
   - Add **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Add **Authorized redirect URIs**:
     - Get your Supabase project URL from the dashboard
     - Add: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - For local testing, also add: `http://localhost:54321/auth/v1/callback`
   
6. Copy the **Client ID** and **Client Secret** that are generated

## 2. Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **xauizkaksoyjymjfmypl**
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list and toggle it ON
5. Enter your Google credentials:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
6. Click **Save**

## 3. Add Redirect URL Environment Variable (Optional)

If deploying to production, add this environment variable in Vercel:

\`\`\`
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=https://yourdomain.com/auth/callback
\`\`\`

For local development, the app will automatically use `http://localhost:3000/auth/callback`

## 4. Test the Integration

1. Run your app locally: `npm run dev`
2. Navigate to `/auth/login`
3. Click "Continue with Google"
4. You should be redirected to Google's login page
5. After successful login, you'll be redirected back to `/dashboard`

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure you've added the correct redirect URI in Google Cloud Console
- The URI should match exactly: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

### "Error: invalid_client"
- Double-check that your Client ID and Client Secret are correctly entered in Supabase
- Ensure there are no extra spaces or characters

### "redirect_uri_mismatch"
- Verify the redirect URI in your Google Cloud Console matches your Supabase project URL
- Check that you've enabled Google auth in Supabase dashboard

### Still having issues?
- Check browser console for error messages
- Verify your Supabase environment variables are set correctly
- Ensure your Supabase project is not paused
