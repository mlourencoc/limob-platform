import { notFound } from 'next/navigation'
import { getBuilderById } from '@/lib/supabase/builder.repo'
import { BuilderForm } from '@/components/builders/BuilderForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBuilderPage({ params }: Props) {
  const { id } = await params
  const builder = await getBuilderById(id)
  if (!builder) notFound()

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Editar construtora</h1>
        <p className="text-sm text-muted-foreground">{builder.name}</p>
      </div>
      <BuilderForm builder={builder} />
    </div>
  )
}
