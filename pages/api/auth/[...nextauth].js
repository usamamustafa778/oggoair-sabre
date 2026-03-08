import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";
import { APILINK } from "../../../config/api";
import { authConfig } from "../../../config/auth";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "***********",
        },
        verified: {
          label: "Verified",
          type: "text",
          placeholder: "verified",
        },
        userId: {
          label: "userId",
          type: "text",
          placeholder: "userId",
        },
      },
      async authorize(credentials) {
        try {
          if (credentials?.verified) {
            if (credentials?.email) {
              const res = await axios.post(
                `${APILINK}/api/users/verified-email-login`,
                {
                  email: credentials.email,
                }
              );
              if (res) {
                return res.data.data;
              } else {
                return null;
              }
            } else if (credentials?.userId) {
              const res = await axios.post(
                `${APILINK}/api/users/verified-email-login`,
                {
                  userId: credentials.userId,
                }
              );
              if (res) {
                return res.data.data;
              } else {
                return null;
              }
            }
          } else {
            const res = await axios.post(
              `${APILINK}/api/users/login`,
              {
                email: credentials?.email,
                password: credentials?.password,
              }
            );
            if (res) {
              return res.data.data;
            } else {
              return null;
            }
          }
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: authConfig.googleClientId,
      clientSecret: authConfig.googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        if (account?.provider === "google") {

          const res = await axios.post(
            `${APILINK}/api/users/register-without-verification`,
            {
              email: user.email,
              name: user.name,
              image: user.image,
              id: user.id,
              userType: "google",
            }
          );

          return true;
        } else if (account?.provider === "credentials") {
        }
        return true;
      } catch (error) {
        throw new Error("something went wrong");
      }
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions); 