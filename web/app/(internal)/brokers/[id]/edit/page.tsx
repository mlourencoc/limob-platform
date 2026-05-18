import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrokerForm } from '@/components/brokers/BrokerForm'
import { getBrokerById } from '@/lib/supabase/broker.repo'

interface PageProps { params: Promise<{ id: string }> }

export default async function EditBrokerPage({ params }: PageProps) {
  const { id } = await params
  const broker = await getBrokerById(id)
  if (!broker) notFound()

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/brokers"><ChevronLeft size={16} className="mr-1" />Voltar</Link>
        </Button>
        <h1 className="text-xl font-semibold">Editar captador</h1>
      </div>
      <BrokerForm broker={broker} />
    </div>
  )
}
