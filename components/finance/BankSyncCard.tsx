'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Link } from 'lucide-react'

interface Props {
  connected: boolean
  lastSynced: string | null
}

export function BankSyncCard({ connected, lastSynced }: Props) {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleSync() {
    setSyncing(true)
    setResult(null)
    const res = await fetch('/api/bank/sync', { method: 'POST' })
    const data = await res.json()
    setResult(data.error ?? `Synced ${data.synced} transactions`)
    setSyncing(false)
    window.location.reload()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Revolut Sync
          {connected
            ? <Badge variant="default" className="bg-green-600">Connected</Badge>
            : <Badge variant="secondary">Not connected</Badge>
          }
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connected ? (
          <>
            {lastSynced && (
              <p className="text-xs text-muted-foreground">Last synced: {new Date(lastSynced).toLocaleString()}</p>
            )}
            <Button className="w-full" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync Now'}
            </Button>
            {result && <p className="text-xs text-muted-foreground">{result}</p>}
          </>
        ) : (
          <a href="/api/bank/connect" className="flex items-center justify-center w-full rounded-md bg-primary text-primary-foreground text-sm h-9 px-4 hover:bg-primary/90 transition-colors">
            <Link className="h-4 w-4 mr-2" />
            Connect Revolut
          </a>
        )}
      </CardContent>
    </Card>
  )
}
