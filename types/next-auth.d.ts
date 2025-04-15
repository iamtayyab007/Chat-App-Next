import "next-auth";

declare module "next-auth" {
  interface User {
    _id?: string;
    username?: string;
    email?: string;
    status?: string;
    avatar?: string;
    lastseen?: Date;
  }

  interface Session {
    user: {
      _id?: string;
      username?: string;
      email?: string;
      status?: string;
      avatar?: string;
      lastseen?: Date;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface jwt {
    _id?: string;
    username?: string;
    email?: string;
    status?: string;
    avatar?: string;
    lastseen?: Date;
  }
}
