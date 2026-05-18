'use client'

import { useEffect } from 'react'
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
import {
  OBJETIVOS,
  CATEGORIAS,
  getTypesByCategoria,
  getSubtiposByTipo,
  hasSubtipos,
} from '@/lib/constants/classifications'
import type { PropertyFormValues } from '@/lib/schemas/property.schema'

export function ClassificationCascade() {
  const form = useFormContext<PropertyFormValues>()
  const categoria = form.watch('categoria')
  const tipo = form.watch('type')

  const tipos = categoria ? getTypesByCategoria(categoria) : []
  const subtipos = (categoria && tipo) ? getSubtiposByTipo(categoria, tipo) : []
  const showSubtipo = subtipos.length > 0

  // Reset cascata quando categoria muda
  useEffect(() => {
    form.setValue('type', '')
    form.setValue('subtype', null)
  }, [categoria, form])

  // Reset subtipo quando tipo muda
  useEffect(() => {
    form.setValue('subtype', null)
  }, [tipo, form])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Objetivo */}
        <FormField
          control={form.control}
          name="objetivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivo *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {OBJETIVOS.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoria */}
        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo — filtrado por Categoria */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? ''}
                disabled={!categoria}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={categoria ? 'Selecionar' : 'Selecione a categoria primeiro'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tipos.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subtipo — filtrado por Tipo (só mostra se tiver subtipos) */}
        {showSubtipo && (
          <FormField
            control={form.control}
            name="subtype"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtipo *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={!tipo}
                >
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subtipos.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  )
}
