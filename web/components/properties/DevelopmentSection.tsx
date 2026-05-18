'use client'

import { useEffect, useTransition } from 'react'
import { useFormContext } from 'react-hook-form'
import {
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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { typeHasUnitData, SUN_POSITIONS } from '@/lib/constants/classifications'
import { getDevelopmentLocationAction } from '@/lib/actions/properties'
import type { PropertyFormValues } from '@/lib/schemas/property.schema'

interface DevelopmentSectionProps {
  developments: Array<{ id: string; name: string }>
}

export function DevelopmentSection({ developments }: DevelopmentSectionProps) {
  const form = useFormContext<PropertyFormValues>()
  const [, startTransition] = useTransition()
  const tipo = form.watch('type')
  const developmentId = form.watch('development_id')
  const showUnitData = tipo ? typeHasUnitData(tipo) : false

  // Quando selecionar empreendimento, auto-popular localização
  useEffect(() => {
    if (!developmentId) return
    startTransition(async () => {
      const locationData = await getDevelopmentLocationAction(developmentId)
      if (locationData) {
        if (locationData.city)         form.setValue('city', locationData.city)
        if (locationData.neighborhood) form.setValue('neighborhood', locationData.neighborhood)
        if (locationData.address)      form.setValue('address', locationData.address)
        if (locationData.builder)      form.setValue('builder', locationData.builder)
      }
    })
  }, [developmentId, form, startTransition])

  return (
    <div className="space-y-4">
      {/* Seletor de Empreendimento */}
      <FormField
        control={form.control}
        name="development_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Empreendimento *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ''}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Selecionar empreendimento" /></SelectTrigger>
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

      {/* Dados da Localização (auto-populados, read-only) */}
      {developmentId && (
        <div className="rounded-md border p-3 space-y-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Dados da Localização
            </p>
            <Badge variant="secondary" className="text-xs">Auto-preenchido</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} readOnly className="bg-muted text-sm" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Bairro</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} readOnly className="bg-muted text-sm" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-xs">Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} readOnly className="bg-muted text-sm" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="builder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Construtora</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} readOnly className="bg-muted text-sm" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Dados da Unidade (condicionais por tipo) */}
      {showUnitData && developmentId && (
        <div className="rounded-md border p-3 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Dados da Unidade
          </p>
          <div className="grid grid-cols-4 gap-3">
            <FormField
              control={form.control}
              name="unit_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Número</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="501" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="floor_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Andar</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="5" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit_final"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Final</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} placeholder="A" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sun_position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Posição do Sol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUN_POSITIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
