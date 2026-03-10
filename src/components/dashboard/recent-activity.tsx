'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface UsageLog {
  id: string
  endpoint: string
  method: string
  status_code: number
  response_time: number
  created_at: string
}

interface RecentActivityProps {
  userId: string
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      const supabase = createClient()

      const { data } = await supabase
        .from('api_usage_logs')
        .select('id, endpoint, method, status_code, response_time, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      setLogs(data || [])
      setLoading(false)
    }

    fetchLogs()
  }, [userId])

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading activity...</div>
  }

  if (logs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No API requests yet. Generate an API key and make your first request!
      </div>
    )
  }

  const getStatusVariant = (code: number): "success" | "warning" | "destructive" | "default" => {
    if (code >= 200 && code < 300) return 'success'
    if (code >= 400 && code < 500) return 'warning'
    if (code >= 500) return 'destructive'
    return 'default'
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Badge variant="outline" className="shrink-0">
              {log.method}
            </Badge>
            <span className="truncate text-muted-foreground">{log.endpoint}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <Badge variant={getStatusVariant(log.status_code)}>
              {log.status_code}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
