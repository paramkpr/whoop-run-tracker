'use client'
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"


export default function Home() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('api/auth/signin')
    },
  })

  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // this uses OUR API endpoint to get the workouts, 
    // the reason we don't have to auth is because this is unreachable
    // without being logged in, however, it is not explict which makes
    // me a little uncomfortable 
    const fetchWorkouts = async () => {
      try {
        const response = await fetch('/api/workouts')
        if (!response.ok) {
          throw new Error('Failed to fetch workouts')
        }
        const data = await response.json()
        console.log('Whoop Data: ', data)
        setWorkouts(data)
      } catch(error) {
        setError(error instanceof Error ? error.message: 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchWorkouts()
    }
  }, [session])

  if (status === "loading" || loading) {
    return (
      <>
        <div className="p-8"> Loading... </div>
      </>
    )
  }

  if (error) {
    return <div className="p-8 text-red-500"> Error: {error} </div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">My Whoop Workouts</h1>
      <pre className="bg-gray-100 text-black p-4 rounded overflow-auto">
        {JSON.stringify(workouts, null, 2)}
      </pre>
    </div>
  )
}
