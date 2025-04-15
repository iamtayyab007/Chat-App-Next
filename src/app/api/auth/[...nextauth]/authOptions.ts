import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import UserModel from "../../../../../models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email/Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        try {
          const existingUser = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!existingUser) {
            return NextResponse.json(
              {
                success: false,
                message: "user doesnot exists, invalid credentials",
              },
              { status: 404 }
            );
          }
          const comparePassword = await bcrypt.compare(
            existingUser.password,
            credentials.password
          );

          if (!comparePassword) {
            return NextResponse.json(
              {
                success: false,
                message: "invalid password",
              },
              { status: 401 }
            );
          }
          return existingUser;
        } catch (error: any) {
          return NextResponse.json(
            {
              success: false,
              message: error.message,
            },
            {
              status: 400,
            }
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.email = user.email;
        token.username = user.username;
        token.avatar = user.avatar;
        token.status = user.status;
        token.lastseen = user.lastseen;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.email = token.email;
        session.user.username = token.username;
        session.user.avatar = token.avatar;
        session.user.status = token.status;
        session.user.lastseen = token.lastseen;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
