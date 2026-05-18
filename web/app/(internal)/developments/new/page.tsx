import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DevelopmentForm } from '@/components/developments/DevelopmentForm'
import { getBuilders } from '@/lib/supabase/builder.repo'

export default async function NewDevelopmentPage() {
  const builders = await getBuilders()

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/developments"><ChevronLeft size={16} className="mr-1" />Voltar</Link>
        </Button>
        <h1 className="text-xl font-semibold">Novo empreendimento</h1>
      </div>
      <DevelopmentForm builders={builders} />
    </div>
  )
}
