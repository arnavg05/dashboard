'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function UserMenu({ email }: { email: string }) {
  const supabase = createClient()
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[180px]">{email}</span>
      <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}
