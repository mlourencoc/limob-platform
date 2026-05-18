import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PropertyForm } from '@/components/properties/PropertyForm'
import { getPropertyById, getFilterOptions } from '@/lib/supabase/property.repo'

interface PageProps { params: Promise<{ id: string }> }

export default async function EditPropertyPage({ params }: PageProps) {
  const { id } = await params
  const [property, { brokers, developments }] = await Promise.all([getPropertyById(id), getFilterOptions()])
  if (!property) notFound()
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/properties/${id}`}><ChevronLeft size={16} className="mr-1" />Voltar</Link>
        </Button>
        <h1 className="text-xl font-semibold">Editar imóvel</h1>
      </div>
      <PropertyForm property={property} brokers={brokers} developments={developments} />
    </div>
  )
}
