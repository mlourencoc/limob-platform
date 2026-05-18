// src/components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  Upload,
  Users,
  Landmark,
  HardHat,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    href: '/properties',
    label: 'Imóveis',
    icon: Building2,
  },
  {
    href: '/imports',
    label: 'Importações',
    icon: Upload,
  },
  {
    href: '/brokers',
    label: 'Captadores',
    icon: Users,
  },
  {
    href: '/developments',
    label: 'Empreendimentos',
    icon: Landmark,
  },
  {
    href: '/builders',
    label: 'Construtoras',
    icon: HardHat,
  },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 border-r bg-card flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b">
        <span className="font-semibold text-base tracking-tight">LIMOB</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="p-3 border-t">
        <p className="text-xs text-muted-foreground">MVP v0.1</p>
      </div>
    </aside>
  )
}
