import { NextAuthOptions } from "next-auth";
import Spotify from "next-auth/providers/spotify";

const scope = `${process.env.SPOTIFY_SCOPE}`;

export const authConfig: NextAuthOptions = {
  providers: [
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      authorization: {
        params: { scope },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  // debug: true,
  callbacks: {
    jwt({ token, account, user }) {
      // ??
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    session({ session, token }: { session: any; token: any }) {
      if (token.accessToken) {
        session.access_token = token.accessToken;
      }
      return session;
    },
  },
};
