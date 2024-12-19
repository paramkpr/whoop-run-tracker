import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/options"
import { getAllWorkouts } from "@/lib/workouts"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
        return NextResponse.json(
            { error: 'Whoop unauthorized'}, 
            { status: 401 }
        )
    }

    try {
        const workouts = await getAllWorkouts(session.accessToken)
        return NextResponse.json({ records: workouts })
    } catch(error) {
        console.error("Fetch error for workout collection: ", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}