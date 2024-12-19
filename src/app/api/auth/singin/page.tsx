'use client'
import { signIn } from "next-auth/react"


export default function SignIn() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <button
            onClick={() => signIn('whoop', { callbackUrl: '/', redirect: true })}
            className="px-4 py-2 bg-blue-500 text-white rounded"
            >
            Sign in with Whoop
            </button>
        </div>
    )  
}
