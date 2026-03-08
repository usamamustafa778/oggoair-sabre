// Auth Configuration
export const authConfig = {
  // NextAuth Configuration
  nextAuthUrl: process.env.NEXTAUTH_URL || 'https://www.oggoair.com',
  nextAuthSecret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here-change-in-production',
  
  // Google OAuth (optional - for Google login)
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  
  // API Configuration
  apiLink: process.env.API_LINK || 'https://www.oggoair.com',
}; 