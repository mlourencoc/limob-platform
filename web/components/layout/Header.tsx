'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
      router.refresh()
    })
  }

  return (
    <header className="border-b bg-white h-16 flex items-center justify-between px-6">
      <div></div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isPending}
        className="text-slate-600 hover:text-slate-900"
      >
        <LogOut className="w-4 h-4 mr-2" />
        {isPending ? 'Saindo...' : 'Sair'}
      </Button>
    </header>
  )
}
