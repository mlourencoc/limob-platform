import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DevelopmentForm } from '@/components/developments/DevelopmentForm'
import { getDevelopmentById } from '@/lib/supabase/development.repo'
import { getBuilders } from '@/lib/supabase/builder.repo'

interface PageProps { params: Promise<{ id: string }> }

export default async function EditDevelopmentPage({ params }: PageProps) {
  const { id } = await params
  const [development, builders] = await Promise.all([
    getDevelopmentById(id),
    getBuilders(),
  ])
  if (!development) notFound()

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/developments"><ChevronLeft size={16} className="mr-1" />Voltar</Link>
        </Button>
        <h1 className="text-xl font-semibold">Editar empreendimento</h1>
      </div>
      <DevelopmentForm development={development} builders={builders} />
    </div>
  )
}
