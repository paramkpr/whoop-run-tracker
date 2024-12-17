import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import { signIn } from "next-auth/react";


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
                params: {
                    scope: "offline read:workout read:recovery read:profile read:body_measurement",
                    redirect_uri: "http://localhost:3000/api/auth/callback/whoop"
                }
            },
            token: {
                url: "https://api.prod.whoop.com/oauth/oauth2/token",
                // whoop expects code in a different way so we must override
                // default next-auth oAuth impl
                async request({ client, params, checks, provider }) {
                  const tokenUrl = "https://api.prod.whoop.com/oauth/oauth2/token" 
                  const searchParams = new URLSearchParams()
                  searchParams.append('grant_type', 'authorization_code')
                  searchParams.append('code', params.code as string)
                  searchParams.append('client_id', provider.clientId!)
                  searchParams.append('client_secret', provider.clientSecret!)
                  searchParams.append('redirect_uri', provider.callbackUrl)
        
                  const response = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: searchParams
                  })
                  const tokens = await response.json()
                  console.log("Token response:", tokens)
                  return { tokens }
                }
            },
            userinfo: "https://api.prod.whoop.com/developer/v1/user/profile/basic",
            clientId: process.env.WHOOP_CLIENT_ID,
            clientSecret: process.env.WHOOP_CLIENT_SECRET,
            profile(profile) {
                console.log("Profile from Whoop:", profile)
                return {
                    id: profile.user_id.toString(),
                    name: `${profile.first_name} ${profile.last_name}`,
                    email: profile.email
                }
            }
        }
    ],
    pages: {
        signIn: 'api/auth/signin',
        error: 'api/auth/error'
    },
    callbacks: {
        async jwt({ token, account, profile }) {
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
        async redirect({ url, baseUrl }) {
            console.log("Redirect Callback: ", {url, baseUrl})
            return url.startsWith(baseUrl) ? url : baseUrl
        }
    },
    debug: true,
    logger: {
        error(code, ...message) {
          console.error(code, message)
        },
        warn(code, ...message) {
          console.warn(code, message)
        },
        debug(code, ...message) {
          console.debug(code, message)
        },
    },
    secret: "do-not-tell-anyone-about-this"
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST}
