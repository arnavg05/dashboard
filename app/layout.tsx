import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { UserMenu } from '@/components/layout/UserMenu'
import { createClient } from '@/lib/supabase/server'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Life Dashboard',
  description: 'Track your health, finances, habits, and studies',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuth = !user

  return (
    <html lang="en" className={`${geist.className} h-full antialiased`}>
      <body className="min-h-full flex">
        {isAuth ? (
          <main className="flex-1">{children}</main>
        ) : (
          <>
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="border-b px-4 py-2 flex items-center justify-end h-12 shrink-0">
                <UserMenu email={user.email ?? ''} />
              </header>
              <main className="flex-1 overflow-auto pb-16 md:pb-0">
                {children}
              </main>
            </div>
            <MobileNav />
          </>
        )}
        <Toaster />
      </body>
    </html>
  )
}
