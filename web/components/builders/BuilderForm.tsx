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
import { createBuilderAction, updateBuilderAction } from '@/lib/actions/builders'
import type { Builder } from '@/types/domain'

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(200),
  phone: z.string().max(30).optional(),
  zipcode: z.string().max(10).optional(),
  state: z.string().max(2).optional(),
  city: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  address: z.string().max(255).optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface BuilderFormProps {
  builder?: Builder
}

function formatZipcode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

export function BuilderForm({ builder }: BuilderFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const isEditing = Boolean(builder)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: builder
      ? {
          name: builder.name,
          phone: builder.phone ?? '',
          zipcode: builder.zipcode ?? '',
          state: builder.state ?? '',
          city: builder.city ?? '',
          neighborhood: builder.neighborhood ?? '',
          address: builder.address ?? '',
          is_active: builder.is_active,
        }
      : { name: '', phone: '', zipcode: '', state: '', city: '', neighborhood: '', address: '', is_active: true },
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
      const result = isEditing
        ? await updateBuilderAction(builder!.id, values)
        : await createBuilderAction(values)

      if (!result.success) {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' })
        return
      }

      toast({ title: isEditing ? 'Construtora atualizada' : 'Construtora cadastrada' })
      router.push('/builders')
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* Nome */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl><Input {...field} placeholder="Nome da construtora" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Telefone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="max-w-xs">
              <FormLabel>Telefone</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ''} placeholder="(00) 00000-0000" /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CEP com busca */}
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
                <Button type="button" variant="outline" onClick={fetchCep} disabled={isFetchingCep} className="shrink-0">
                  {isFetchingCep
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Search className="w-4 h-4 mr-2" />Consultar</>
                  }
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Consulte o CEP para preencher automaticamente ou preencha manualmente.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* UF e Cidade */}
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
                <FormLabel className="!mt-0 font-normal cursor-pointer">Ativa</FormLabel>
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar construtora'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}
