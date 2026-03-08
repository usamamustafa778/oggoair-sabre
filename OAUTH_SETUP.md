# OAuth Setup Guide for OggoAir

This guide will help you set up Google and Apple OAuth authentication for your application.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret

# API Configuration
API_LINK=http://localhost:5000
```

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set the application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to your environment variables

## Apple Sign-In Setup

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new App ID with "Sign In with Apple" capability
4. Create a new Service ID for web authentication
5. Configure the Service ID:
   - Add your domain and redirect URL: `https://yourdomain.com/api/auth/callback/apple`
   - For development: `http://localhost:3000/api/auth/callback/apple`
6. Create a private key for "Sign In with Apple"
7. Download the key file (.p8) and note the Key ID
8. Use the following format for your Apple Client Secret:
   ```
   {
     "kid": "YOUR_KEY_ID",
     "iss": "YOUR_TEAM_ID",
     "aud": "https://appleid.apple.com",
     "sub": "YOUR_SERVICE_ID"
   }
   ```

## Testing the Implementation

1. Start your development server: `npm run dev`
2. Navigate to your application and try the authentication flow
3. Test both Google and Apple Sign-In buttons
4. Verify that users are properly registered in your backend

## Troubleshooting

### Google OAuth Issues
- Ensure redirect URIs match exactly (including protocol and port)
- Check that the Google+ API is enabled
- Verify client ID and secret are correct

### Apple Sign-In Issues
- Apple Sign-In only works on HTTPS in production
- Ensure your Service ID is properly configured
- Check that the private key is correctly formatted
- Verify the Team ID and Key ID are correct

### General Issues
- Check browser console for error messages
- Verify environment variables are loaded correctly
- Ensure NextAuth is properly configured
- Check that your backend API endpoints are working

## Security Notes

- Never commit your `.env.local` file to version control
- Use strong, unique secrets for production
- Regularly rotate your OAuth credentials
- Monitor your OAuth usage in the respective developer consoles
