'use client'
import { useSession, signOut } from "next-auth/react"


export default function Navbar() {
    const {data: session} = useSession()

    if (!session) return null  // don't show navbar if not logged in 

    return (
        <nav className="bg-dark shadow px-8 py-4">
            <div className="flex justify-between items-center">
            <h1 className="text-xl text-white font-bold">WhoopRunTracker</h1>
            <button
                onClick={() => signOut({ callbackUrl: '/', redirect: true})}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
                Sign Out
            </button>
            </div>
        </nav>
    )
}