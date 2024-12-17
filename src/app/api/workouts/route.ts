import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
        return NextResponse.json({ error: 'Whoop unauthorized'}, { status: 401 })
    }

    try {
        const whoopResponse = await fetch(process.env.WHOOP_BASE_URL + '/v1/activity/workout', {
            headers: {
                'Authorization': `Bearer ${session.accessToken}`
            }
        })

        if (!whoopResponse.ok) {
            console.error('Whoop API Error: ', await whoopResponse.text())
            return NextResponse.json(
                { error: "Failed to fetch from Whoop API" },
                { status: whoopResponse.status }
            )
        }

        const data = await whoopResponse.json()
        return NextResponse.json(data)
    } catch(error) {
        console.error("Fetch error for workout collection: ", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
