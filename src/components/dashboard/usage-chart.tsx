'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

interface UsageChartProps {
  userId: string
}

export function UsageChart({ userId }: UsageChartProps) {
  const [data, setData] = useState<{ date: string; requests: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const days = []

      // Get last 7 days of data
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i)
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)

        const { count } = await supabase
          .from('api_usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())

        days.push({
          date: format(date, 'MMM dd'),
          requests: count || 0,
        })
      }

      setData(days)
      setLoading(false)
    }

    fetchData()
  }, [userId])

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="requests" stroke="hsl(var(--primary))" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
