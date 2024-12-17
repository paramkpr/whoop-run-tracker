'use client'
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"


export default function ProtectedPage() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('api/auth/signin')
        },
    })

    if (status === "loading") {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1> Protected Page </h1>
            <p> Logged in as { session?.user?.email }</p>
        </div>
    )
}
