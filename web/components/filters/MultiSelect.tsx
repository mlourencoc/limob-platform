// src/components/filters/MultiSelect.tsx
'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  maxDisplayed?: number
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecionar...',
  className,
  maxDisplayed = 2,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  function toggle(optionValue: string) {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange([])
  }

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between h-auto min-h-9 px-3', className)}
        >
          {value.length === 0 ? (
            <span className="text-muted-foreground font-normal text-xs">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {selectedLabels.slice(0, maxDisplayed).map((label) => (
                <Badge key={label} variant="secondary" className="text-[11px] font-normal">
                  {label}
                </Badge>
              ))}
              {selectedLabels.length > maxDisplayed && (
                <Badge variant="secondary" className="text-[11px] font-normal">
                  +{selectedLabels.length - maxDisplayed}
                </Badge>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0">
            {value.length > 0 && (
              <X
                size={13}
                className="text-muted-foreground hover:text-foreground"
                onClick={clear}
              />
            )}
            <ChevronsUpDown size={13} className="text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="text-xs text-center py-4">Nenhuma opção.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => toggle(option.value)}
                  className="text-xs"
                >
                  <Check
                    size={13}
                    className={cn(
                      'mr-2 shrink-0',
                      value.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
