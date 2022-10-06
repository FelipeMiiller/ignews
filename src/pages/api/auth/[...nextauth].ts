import { query as q } from "faunadb";
import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { fauna } from "../../../services/fauna";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: "read:user",
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn( user, account, profile ) {
      console.log(user.user.email);
   
      const email = user.user.email
      const name = user.user.name

      await fauna.query(
        q.Create(
          q.Collection('users'),
          {
            data: user.user
            
          },
        )
      )

      return true;
    },
  },
};
export default NextAuth(authOptions);
