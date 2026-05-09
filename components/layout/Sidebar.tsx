'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Activity, DollarSign, CheckSquare, BookOpen, LayoutDashboard,
} from 'lucide-react'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/health', label: 'Health', icon: Activity },
  { href: '/finance', label: 'Finance', icon: DollarSign },
  { href: '/habits', label: 'Habits', icon: CheckSquare },
  { href: '/study', label: 'Study', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 border-r bg-card min-h-screen p-4 gap-1">
      <div className="px-2 py-4 mb-2">
        <span className="font-bold text-lg">Life Dashboard</span>
      </div>
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            pathname === href || (href !== '/' && pathname.startsWith(href))
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </aside>
  )
}
