import { query as q, query } from "faunadb";
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
    async signIn(user, account, profile) {
      console.log(user.user.email);

      const email = user.user.email;
      const name = user.user.name;

      try {
        await fauna
          .query(
            q.If(
              q.Not(
                q.Exists(
                  q.Match(q.Index("user_by_email"), q.Casefold(user.user.email))
                )
              ),
              q.Create(q.Collection("users"), {
                data: user.user,
              }),
              q.Update(q.Ref(q.Index("user_by_email"), user.user.email), {
                data: {
                  name: user.user.name,
                  image: user.user.image,
                },
              })
            )
          )
          .then((ret) => console.log(ret))
          .catch((err) =>
            console.error(
              "Error: [%s] %s: %s",
              err.name,
              err.message,
              err.errors()[0].description
            )
          );

        return true;
      } catch {
        return false;
      }

      return true;
    },
  },
};
export default NextAuth(authOptions);
