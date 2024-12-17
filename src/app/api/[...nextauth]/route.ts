import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";


declare module "next-auth" {
    interface Session {
        accessToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string
        refreshToken?: string
    }
}


export const authOptions: AuthOptions = {
    providers: [
        {
            id: "whoop",
            name: "Whoop",
            type: "oauth",
            authorization: {
                url: "https://api.prod.whoop.com/oauth/oauth2/auth",
                params: { scope: "offline read:workout read:recovery read:profile read:body_measurement"}
            },
            token: "https://api.prod.whoop.com/oauth/oauth2/token",
            userinfo: "https://api.prod.whoop.com/developer/v1/user/profile/basic",
            clientId: process.env.WHOOP_CLIENT_ID,
            clientSecret: process.env.WHOOP_CLIENT_SECRET,
            profile(profile) {
                return {
                    id: profile.user_id.toString(),
                    name: `${profile.first_name} ${profile.last_name}`,
                    email: profile.email
                }
            }
        }
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken
            return session
        },
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST}
