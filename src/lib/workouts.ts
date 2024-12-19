import { Workout } from '@/lib/types'  // Import the type we created earlier

// src/lib/whoop.ts
interface WhoopResponse {
    records: Workout[]
    next_token?: string
}

export async function getWorkoutList(next_token: string | null, accessToken: string): Promise<WhoopResponse> {
    const params = new URLSearchParams({ limit: '25' })
    if (next_token) {
        params.set('next_token', next_token)
    }

    const response = await fetch(
        `${process.env.WHOOP_BASE_URL}/v1/activity/workout?${params}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })

    if (!response.ok) {
        throw new Error(`Whoop API Error: ${await response.text()}`)
    }

    const data = await response.json()
    console.log("Fetched workouts with token:", next_token, "Next token:", data.next_token)
    return data
}

export async function getAllWorkouts(accessToken: string, limit = 200) {
    let result = await getWorkoutList(null, accessToken)
    let allWorkouts = [...result.records]
    const seenTokens = new Set([result.next_token]) // Track tokens we've seen

    while (result.next_token && allWorkouts.length < limit && !seenTokens.has(result.next_token)) {
        console.log(`Fetching page with token: ${result.next_token}. Current count: ${allWorkouts.length}`)
        seenTokens.add(result.next_token)
        result = await getWorkoutList(result.next_token, accessToken)
        allWorkouts = [...allWorkouts, ...result.records]
    }

    console.log(`Final workout count: ${allWorkouts.length}`)
    return allWorkouts
}