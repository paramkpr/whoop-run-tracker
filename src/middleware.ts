// middleware.ts
// here we define a middleware that will check the user's 
// whoop oAuth creds and sign the user out if the creds are bad

import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import { NextRequest } from "next/server" 


export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request })

    // handle token errors here
    if (token?.error === "RefreshAccessTokenError") {
        return NextResponse.redirect(
            new URL("/api/auth/signin?error=expired", request.url)
        )
    }

    if (!token) {
        console.log("token not set thats why")
        return NextResponse.redirect(
            new URL("/api/auth/signin", request.url)
            )
    }

    return NextResponse.next()
}


export const config = {
    /*(               # Match paths that start with /
        (?!           # Negative lookahead - don't match if it starts with...
          api/auth|   # /api/auth OR
          _next|      # /_next OR
          static|     # /static OR
          signin      # /signin
        )
        .*           # Match any characters after that
      )*/

        matcher: [
            // '/',              // Protect home page
            '/dashboard/:path*',   // Protect dashboard and all its sub-routes
            // '/api/((?!auth).*)' // Protect all API routes except /api/auth/*
          ]
        
}
