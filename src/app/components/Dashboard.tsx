'use client'

import { useState, useMemo } from 'react'
import { groupBy } from 'lodash'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Workout } from '@/lib/types'
import { SPORT_TYPES } from '@/lib/constants'

interface DashboardProps {
  workouts: Workout[]
}

type ChartDataPoint = {
  date: string
  distance: number
  heartRate: number
  calories: number
  workoutCount: number
}

const WorkoutDashboard = ({ workouts }: DashboardProps) => {
  const [selectedSportId, setSelectedSportId] = useState<number>(0)
  const [workoutLimit, setWorkoutLimit] = useState<number>(10)

  // First filter by sport and get most recent N workouts
  const filteredWorkouts = useMemo(() => {
    return [...workouts]
      .filter(w => w.sport_id === selectedSportId)
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()) // newest first
      .slice(0, workoutLimit)
  }, [workouts, selectedSportId, workoutLimit])

  const chartData: ChartDataPoint[] = useMemo(() => {
    const getDateKey = (workout: Workout) => {
      // Create date using workout's timezone offset
      const date = new Date(workout.start)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const offset = workout.timezone_offset
      const userDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
      return userDate.toLocaleDateString()
    }

    const byDate = groupBy(filteredWorkouts, getDateKey)

    return Object.entries(byDate)
      .map(([date, dayWorkouts]) => ({
        date,
        distance: dayWorkouts.reduce((sum, w) => sum + w.score.distance_meter, 0) / 1000,
        heartRate: Math.round(
          dayWorkouts.reduce((sum, w) => sum + w.score.average_heart_rate, 0) / dayWorkouts.length
        ),
        calories: Math.round(
          dayWorkouts.reduce((sum, w) => sum + w.score.kilojoule, 0) / 4.184
        ),
        workoutCount: dayWorkouts.length
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [filteredWorkouts])

  // Calculate metrics based on filtered workouts
  const totalDistance = useMemo(() => 
    filteredWorkouts.reduce((sum, w) => sum + w.score.distance_meter, 0) / 1000,
    [filteredWorkouts]
  )

  const lastWeekDistance = useMemo(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return filteredWorkouts
      .filter(w => new Date(w.start) >= oneWeekAgo)
      .reduce((acc, w) => acc + w.score.distance_meter, 0) / 1000
  }, [filteredWorkouts])

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex gap-4 mb-4">
        <select 
          value={selectedSportId}
          onChange={(e) => setSelectedSportId(Number(e.target.value))}
          className="p-2 border rounded text-black"
        >
          {Object.entries(SPORT_TYPES).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select
          value={workoutLimit}
          onChange={(e) => setWorkoutLimit(Number(e.target.value))}
          className="p-2 border rounded text-black"
        >
          {[5, 10, 20, 30, 50, 100].map(limit => (
            <option key={limit} value={limit}>Last {limit} workouts</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 text-black">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold">Last 7 Days</h3>
          <p className="text-2xl">{lastWeekDistance.toFixed(2)} km</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold">Selected {filteredWorkouts.length} Workouts</h3>
          <p className="text-2xl">{totalDistance.toFixed(2)} km</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="h-72 bg-white p-4 rounded shadow">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(2)} ${name === 'Distance (km)' ? 'km' : ''}`,
                  `${props.payload.workoutCount} workout${props.payload.workoutCount > 1 ? 's' : ''}`
                ]}
              />
              <Legend />
              <Line type="monotone" dataKey="distance" stroke="#8884d8" name="Distance (km)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72 bg-white p-4 rounded shadow">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: number, name: string, props: any) => [
                  `${value} bpm`,
                  `${props.payload.workoutCount} workout${props.payload.workoutCount > 1 ? 's' : ''}`
                ]}
              />
              <Legend />
              <Line type="monotone" dataKey="heartRate" stroke="#82ca9d" name="Avg Heart Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72 bg-white p-4 rounded shadow">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(0)} kcal`,
                  `${props.payload.workoutCount} workout${props.payload.workoutCount > 1 ? 's' : ''}`
                ]}
              />
              <Legend />
              <Line type="monotone" dataKey="calories" stroke="#ffc658" name="Calories" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full bg-white text-black rounded shadow">
          <thead>
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Distance (km)</th>
              <th className="p-4 text-left">Avg HR</th>
              <th className="p-4 text-left">Calories</th>
              <th className="p-4 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkouts.map(workout => (
              <tr key={workout.id}>
                <td className="p-4">{new Date(workout.start).toLocaleDateString()}</td>
                <td className="p-4">{(workout.score.distance_meter / 1000).toFixed(2)}</td>
                <td className="p-4">{workout.score.average_heart_rate}</td>
                <td className="p-4">{(workout.score.kilojoule / 4.184).toFixed(0)}</td>
                <td className="p-4">
                  {Math.round((new Date(workout.end).getTime() - new Date(workout.start).getTime()) / 60000)} min
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WorkoutDashboard