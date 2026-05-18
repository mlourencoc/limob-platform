import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PropertyForm } from '@/components/properties/PropertyForm'
import { getFilterOptions } from '@/lib/supabase/property.repo'

export default async function NewPropertyPage() {
  const { brokers, developments } = await getFilterOptions()
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/properties"><ChevronLeft size={16} className="mr-1" />Voltar</Link>
        </Button>
        <h1 className="text-xl font-semibold">Novo imóvel</h1>
      </div>
      <PropertyForm brokers={brokers} developments={developments} />
    </div>
  )
}
