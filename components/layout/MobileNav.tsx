'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Activity, DollarSign, CheckSquare, BookOpen, LayoutDashboard } from 'lucide-react'

const nav = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/health', label: 'Health', icon: Activity },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/study', label: 'Study', icon: BookOpen },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-card z-50 flex">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 py-2 text-[10px] gap-1 transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
