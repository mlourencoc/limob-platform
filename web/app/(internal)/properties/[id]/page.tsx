import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PropertyDetail } from '@/components/properties/PropertyDetail'
import { getPropertyById } from '@/lib/supabase/property.repo'

interface PageProps { params: Promise<{ id: string }> }

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params
  const property = await getPropertyById(id)
  if (!property) notFound()
  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/properties"><ChevronLeft size={16} className="mr-1" />Voltar</Link>
          </Button>
          <h1 className="text-xl font-semibold">{property.development_name ?? property.city}</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/properties/${id}/edit`}><Pencil size={14} className="mr-1.5" />Editar</Link>
        </Button>
      </div>
      <PropertyDetail property={property} />
    </div>
  )
}
