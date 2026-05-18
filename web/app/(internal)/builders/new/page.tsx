import { BuilderForm } from '@/components/builders/BuilderForm'

export default function NewBuilderPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nova construtora</h1>
        <p className="text-sm text-muted-foreground">Preencha os dados da construtora</p>
      </div>
      <BuilderForm />
    </div>
  )
}
