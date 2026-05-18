// src/components/properties/PropertyForm.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Separator } from '@/components/ui/separator'
import { propertySchema, type PropertyFormValues } from '@/lib/schemas/property.schema'
import { createProperty, updateProperty } from '@/lib/actions/properties'
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_SUBTYPE_LABELS,
  PROPERTY_STATE_LABELS,
  PROPERTY_SITUATION_LABELS,
  COMMERCIAL_STATUS_LABELS,
  DELIVERY_STATUS_LABELS,
} from '@/lib/constants/labels'
import {
  PROPERTY_TYPES,
  PROPERTY_SUBTYPES,
  PROPERTY_STATES,
  PROPERTY_SITUATIONS,
  COMMERCIAL_STATUSES,
  DELIVERY_STATUSES,
} from '@/types/domain'
import type { PropertyWithLinks } from '@/types/domain'

interface PropertyFormProps {
  property?: PropertyWithLinks        // se passado = modo edição
  brokers: Array<{ id: string; name: string }>
  developments: Array<{ id: string; name: string }>
}

export function PropertyForm({ property, brokers, developments }: PropertyFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(property)

  const form = useForm<PropertyFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(propertySchema) as any,
    defaultValues: property
      ? {
          type: property.type,
          subtype: property.subtype ?? undefined,
          city: property.city,
          neighborhood: property.neighborhood ?? '',
          address: property.address ?? '',
          development_id: property.development_id ?? undefined,
          broker_id: property.broker_id ?? undefined,
          unit: property.unit ?? '',
          builder: property.builder ?? '',
          area_m2: property.area_m2 ?? undefined,
          bedrooms: property.bedrooms ?? undefined,
          suites: property.suites ?? undefined,
          parking_spots: property.parking_spots ?? undefined,
          storage_unit: property.storage_unit,
          price: property.price ?? undefined,
          condo_fee: property.condo_fee ?? undefined,
          state: property.state ?? undefined,
          situation: property.situation ?? undefined,
          commercial_status: property.commercial_status,
          delivery_status: property.delivery_status ?? undefined,
          delivery_year: property.delivery_year ?? undefined,
          description: property.description ?? '',
          highlights: property.highlights ?? [],
          links: property.links?.map((l) => ({
            type: l.type,
            url: l.url,
            label: l.label ?? undefined,
            sort_order: l.sort_order,
          })) ?? [],
        }
      : {
          commercial_status: 'disponivel',
          storage_unit: false,
          highlights: [],
          links: [],
        },
  })

  function onSubmit(values: PropertyFormValues) {
    startTransition(async () => {
      const result = isEditing
        ? await updateProperty(property!.id, values)
        : await createProperty(values)

      if (!result.success) {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' })
        return
      }

      toast({ title: isEditing ? 'Imóvel atualizado' : 'Imóvel cadastrado' })
      router.push(isEditing ? `/properties/${property!.id}` : '/properties')
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Classificação */}
        <Section title="Classificação">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtype"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_SUBTYPES.map((t) => (
                        <SelectItem key={t} value={t}>{PROPERTY_SUBTYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        <Separator />

        {/* Localização */}
        <Section title="Localização">
          <div className="grid grid-cols-2 gap-4">
            <TextField control={form.control} name="city" label="Cidade *" />
            <TextField control={form.control} name="neighborhood" label="Bairro" />
            <TextField control={form.control} name="address" label="Endereço" className="col-span-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="development_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empreendimento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {developments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TextField control={form.control} name="builder" label="Construtora" />
            <TextField control={form.control} name="unit" label="Unidade" />
          </div>
        </Section>

        <Separator />

        {/* Composição */}
        <Section title="Composição">
          <div className="grid grid-cols-4 gap-4">
            <NumberField control={form.control} name="area_m2" label="Área (m²)" />
            <NumberField control={form.control} name="bedrooms" label="Quartos" />
            <NumberField control={form.control} name="suites" label="Suítes" />
            <NumberField control={form.control} name="parking_spots" label="Vagas" />
          </div>
          <FormField
            control={form.control}
            name="storage_unit"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 mt-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 font-normal cursor-pointer">Escaninho</FormLabel>
              </FormItem>
            )}
          />
        </Section>

        <Separator />

        {/* Valores */}
        <Section title="Valores">
          <div className="grid grid-cols-2 gap-4">
            <NumberField control={form.control} name="price" label="Valor (R$)" />
            <NumberField control={form.control} name="condo_fee" label="Condomínio (R$)" />
          </div>
        </Section>

        <Separator />

        {/* Status */}
        <Section title="Status">
          <div className="grid grid-cols-2 gap-4">
            <SelectField control={form.control} name="commercial_status" label="Status comercial"
              options={COMMERCIAL_STATUSES.map((s) => ({ value: s, label: COMMERCIAL_STATUS_LABELS[s] }))} />
            <SelectField control={form.control} name="state" label="Estado"
              options={PROPERTY_STATES.map((s) => ({ value: s, label: PROPERTY_STATE_LABELS[s] }))} />
            <SelectField control={form.control} name="situation" label="Situação"
              options={PROPERTY_SITUATIONS.map((s) => ({ value: s, label: PROPERTY_SITUATION_LABELS[s] }))} />
            <SelectField control={form.control} name="delivery_status" label="Status de entrega"
              options={DELIVERY_STATUSES.map((s) => ({ value: s, label: DELIVERY_STATUS_LABELS[s] }))} />
            <NumberField control={form.control} name="delivery_year" label="Ano de entrega" />
          </div>
        </Section>

        <Separator />

        {/* Captador */}
        <Section title="Captador">
          <FormField
            control={form.control}
            name="broker_id"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Captador</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brokers.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Separator />

        {/* Descrição */}
        <Section title="Descrição">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Descrição do imóvel..."
                    className="min-h-24 resize-y"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar imóvel'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ============================================================
// Sub-componentes auxiliares (reduzem repetição no form)
// ============================================================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      {children}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TextField({ control, name, label, className }: { control: any; name: any; label: string; className?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NumberField({ control, name, label }: { control: any; name: any; label: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              {...field}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SelectField({
  control, name, label, options,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any; name: any; label: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
