'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createBrokerAction, updateBrokerAction } from '@/lib/actions/brokers'
import type { Broker } from '@/types/domain'

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').max(150),
  email: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  creci: z.string().max(30).optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface BrokerFormProps {
  broker?: Broker
}

export function BrokerForm({ broker }: BrokerFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(broker)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: broker
      ? {
          name: broker.name,
          email: broker.email ?? '',
          phone: broker.phone ?? '',
          creci: broker.creci ?? '',
          is_active: broker.is_active,
        }
      : { name: '', email: '', phone: '', creci: '', is_active: true },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateBrokerAction(broker!.id, values)
        : await createBrokerAction(values)

      if (!result.success) {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' })
        return
      }

      toast({ title: isEditing ? 'Captador atualizado' : 'Captador cadastrado' })
      router.push('/brokers')
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl><Input type="email" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="creci"
          render={({ field }) => (
            <FormItem className="max-w-xs">
              <FormLabel>CRECI</FormLabel>
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
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar captador'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}
