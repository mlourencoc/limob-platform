'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition, useState } from 'react'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Search } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createDevelopmentAction, updateDevelopmentAction } from '@/lib/actions/developments'
import type { Development, Builder } from '@/types/domain'

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(200),
  builder: z.string().max(150).optional(),
  zipcode: z.string().max(10).optional(),
  state: z.string().max(2).optional(),
  city: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface DevelopmentFormProps {
  development?: Development
  builders?: Builder[]
}

function extractMeta(development: Development) {
  const meta = development.metadata as Record<string, string> | null
  return {
    zipcode: meta?.zipcode ?? '',
    state: meta?.state ?? '',
  }
}

function formatZipcode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

export function DevelopmentForm({ development, builders = [] }: DevelopmentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const isEditing = Boolean(development)
  const meta = development ? extractMeta(development) : { zipcode: '', state: '' }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: development
      ? {
          name: development.name,
          builder: development.builder ?? '',
          zipcode: meta.zipcode,
          state: meta.state,
          city: development.city ?? '',
          neighborhood: development.neighborhood ?? '',
          address: development.address ?? '',
          is_active: development.is_active,
        }
      : { name: '', builder: '', zipcode: '', state: '', city: '', neighborhood: '', address: '', is_active: true },
  })

  async function fetchCep() {
    const raw = form.getValues('zipcode') ?? ''
    const digits = raw.replace(/\D/g, '')

    if (digits.length !== 8) {
      toast({ title: 'CEP inválido', description: 'Digite um CEP com 8 dígitos.', variant: 'destructive' })
      return
    }

    setIsFetchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()

      if (data.erro) {
        toast({ title: 'CEP não encontrado', variant: 'destructive' })
        return
      }

      // Preencher campos automaticamente
      if (data.logradouro) form.setValue('address', data.logradouro)
      if (data.bairro) form.setValue('neighborhood', data.bairro)
      if (data.localidade) form.setValue('city', data.localidade)
      if (data.uf) form.setValue('state', data.uf)

      toast({ title: 'Endereço preenchido!' })
    } catch {
      toast({ title: 'Erro ao consultar CEP', variant: 'destructive' })
    } finally {
      setIsFetchingCep(false)
    }
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      // Incluir zipcode e state no metadata
      const payload = {
        ...values,
        metadata: {
          zipcode: values.zipcode ?? '',
          state: values.state ?? '',
        },
      }

      const result = isEditing
        ? await updateDevelopmentAction(development!.id, payload)
        : await createDevelopmentAction(payload)

      if (!result.success) {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' })
        return
      }

      toast({ title: isEditing ? 'Empreendimento atualizado' : 'Empreendimento cadastrado' })
      router.push('/developments')
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* Nome e Construtora */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="builder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Construtora</FormLabel>
              {builders.length > 0 ? (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar construtora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {builders.map((b) => (
                      <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <FormControl><Input {...field} value={field.value ?? ''} placeholder="Nome da construtora" /></FormControl>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CEP com busca automática */}
        <div className="space-y-1">
          <FormField
            control={form.control}
            name="zipcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="00000-000"
                      maxLength={9}
                      className="max-w-[160px]"
                      onChange={(e) => field.onChange(formatZipcode(e.target.value))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), fetchCep())}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchCep}
                    disabled={isFetchingCep}
                    className="shrink-0"
                  >
                    {isFetchingCep
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <><Search className="w-4 h-4 mr-2" />Consultar</>
                    }
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Consulte o CEP para preencher o endereço automaticamente, ou preencha manualmente abaixo.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Estado e Cidade */}
        <div className="grid grid-cols-[80px_1fr] gap-4">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UF</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    placeholder="SP"
                    maxLength={2}
                    className="uppercase"
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bairro e Endereço */}
        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 font-normal cursor-pointer">Ativo</FormLabel>
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar empreendimento'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}
