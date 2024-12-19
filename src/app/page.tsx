// src/app/page.tsx
'use client'
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"
import Dashboard from './components/Dashboard'
import { Workout } from '@/lib/types'  // Import the type we created earlier

export default function Home() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('api/auth/signin')
    },
  })

  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch('/api/workouts')
        if (!response.ok) {
          throw new Error(`Failed to fetch workouts. Error Code: ${response.status}`)
        }

        const data = await response.json()
        setWorkouts(data.records)  // Note: assuming the API returns { records: Workout[] }

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Whoop Workout Analytics
          </h1>
          {workouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No workouts found</p>
            </div>
          ) : (
            <Dashboard workouts={workouts} />
          )}
        </div>
      </div>
    </div>
  )
}