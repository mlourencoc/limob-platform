'use client'

import { useState, useTransition, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Plus, Pencil, Trash2, Check, X, ChevronRight, GripVertical, ArrowLeft } from 'lucide-react'
import {
  createGroupAction, updateGroupAction, deleteGroupsAction, reorderGroupsAction,
  createSubgroupAction, updateSubgroupAction, deleteSubgroupsAction, reorderSubgroupsAction,
  createFieldAction, updateFieldAction, deleteFieldsAction, reorderFieldsAction,
  getConfigDataAction,
} from '@/lib/actions/config'
import type { ConfigGroup, ConfigSubgroup, ConfigField } from '@/types/domain'

interface Props {
  initialGroups: ConfigGroup[]
  initialSubgroups: ConfigSubgroup[]
  initialFields: ConfigField[]
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ============================================================
// SortableRow — item arrastável genérico
// ============================================================
function SortableRow({
  id, children,
}: {
  id: string
  children: (dragHandleProps: React.HTMLAttributes<HTMLElement>, isDragging: boolean) => React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }
  return (
    <div ref={setNodeRef} style={style}>
      {children({ ...attributes, ...listeners }, isDragging)}
    </div>
  )
}

// ============================================================
// OptionsEditor
// ============================================================
function OptionsEditor({ options, onChange }: { options: string[]; onChange: (v: string[]) => void }) {
  const [newOption, setNewOption] = useState('')

  function add() {
    const trimmed = newOption.trim()
    if (!trimmed || options.includes(trimmed)) return
    onChange([...options, trimmed])
    setNewOption('')
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">Opções</label>
      <div className="space-y-1">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-1">
            <Input
              value={opt}
              onChange={(e) => {
                const next = [...options]; next[i] = e.target.value; onChange(next)
              }}
              className="h-7 text-xs flex-1"
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive shrink-0"
              onClick={() => onChange(options.filter((_, j) => j !== i))}>
              <X size={11} />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Nova opção... (Enter para adicionar)"
          className="h-7 text-xs flex-1"
        />
        <Button size="icon" variant="outline" className="h-7 w-7 shrink-0" onClick={add}>
          <Plus size={11} />
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Forms (fora dos tabs para evitar re-mount)
// ============================================================
function GroupForm({ title, name, slug, onNameChange, onSlugChange, onSave, onCancel, isPending }: {
  title: string; name: string; slug: string
  onNameChange: (v: string) => void; onSlugChange: (v: string) => void
  onSave: () => void; onCancel: () => void; isPending: boolean
}) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Nome</label>
        <Input autoFocus value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Ex: Imóveis" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Slug</label>
        <Input value={slug} onChange={(e) => onSlugChange(e.target.value)} placeholder="Ex: imoveis" className="h-8 text-sm" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={isPending} className="h-7 text-xs gap-1"><Check size={12} />Salvar</Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isPending} className="h-7 text-xs gap-1"><X size={12} />Cancelar</Button>
      </div>
    </div>
  )
}

function SubgroupForm({ title, name, onNameChange, onSave, onCancel, isPending }: {
  title: string; name: string
  onNameChange: (v: string) => void
  onSave: () => void; onCancel: () => void; isPending: boolean
}) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Nome</label>
        <Input autoFocus value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Ex: Dados do Imóvel" className="h-8 text-sm" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={isPending} className="h-7 text-xs gap-1"><Check size={12} />Salvar</Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isPending} className="h-7 text-xs gap-1"><X size={12} />Cancelar</Button>
      </div>
    </div>
  )
}

function FieldForm({ title, name, fieldKey, options, onNameChange, onKeyChange, onOptionsChange, onSave, onCancel, isPending }: {
  title: string; name: string; fieldKey: string; options: string[]
  onNameChange: (v: string) => void; onKeyChange: (v: string) => void; onOptionsChange: (v: string[]) => void
  onSave: () => void; onCancel: () => void; isPending: boolean
}) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Nome</label>
          <Input autoFocus value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Ex: Status Comercial" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Chave (opcional)</label>
          <Input value={fieldKey} onChange={(e) => onKeyChange(e.target.value)} placeholder="Ex: commercial_status" className="h-8 text-sm" />
        </div>
      </div>
      <OptionsEditor options={options} onChange={onOptionsChange} />
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={isPending} className="h-7 text-xs gap-1"><Check size={12} />Salvar</Button>
        <Button size="sm" variant="outline" onClick={onCancel} disabled={isPending} className="h-7 text-xs gap-1"><X size={12} />Cancelar</Button>
      </div>
    </div>
  )
}

// ============================================================
// GROUPS TAB
// ============================================================
function GroupsTab({ groups, onSelectGroup, onRefresh }: {
  groups: ConfigGroup[]; onSelectGroup: (g: ConfigGroup) => void; onRefresh: () => void
}) {
  const [isPending, start] = useTransition()
  const [items, setItems] = useState(groups)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')

  // sync when groups prop changes
  useState(() => { setItems(groups) })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(g => g.id === active.id)
    const newIndex = items.findIndex(g => g.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
    start(async () => {
      const reordered = newItems.map((g, i) => ({ id: g.id, display_order: i + 1 }))
      const r = await reorderGroupsAction(reordered)
      if (!r.success) { toast({ title: 'Erro ao reordenar', variant: 'destructive' }); setItems(items) }
    })
  }

  const toggleAll = (v: boolean) => setSelected(v ? new Set(items.map(g => g.id)) : new Set())
  const toggle = (id: string, v: boolean) => {
    const next = new Set(selected); v ? next.add(id) : next.delete(id); setSelected(next)
  }

  const handleNewName = useCallback((v: string) => { setNewName(v); setNewSlug(slugify(v)) }, [])
  const handleEditName = useCallback((v: string) => { setEditName(v); setEditSlug(slugify(v)) }, [])

  function startEdit(g: ConfigGroup) {
    setEditingId(g.id); setEditName(g.name); setEditSlug(g.slug); setShowCreate(false)
  }

  function saveCreate() {
    if (!newName.trim()) return
    start(async () => {
      const r = await createGroupAction(newName.trim(), newSlug.trim() || slugify(newName.trim()))
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Grupo criado' }); setShowCreate(false); setNewName(''); setNewSlug(''); onRefresh()
    })
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return
    start(async () => {
      const r = await updateGroupAction(editingId, editName.trim(), editSlug.trim() || slugify(editName.trim()))
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Grupo atualizado' }); setEditingId(null); onRefresh()
    })
  }

  function deleteSelected() {
    if (!selected.size) return
    start(async () => {
      const r = await deleteGroupsAction([...selected])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: `${selected.size} grupo(s) excluído(s)` }); setSelected(new Set()); onRefresh()
    })
  }

  function deleteSingle(id: string) {
    start(async () => {
      const r = await deleteGroupsAction([id])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Grupo excluído' }); onRefresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>{selected.size > 0 && (
          <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={deleteSelected} disabled={isPending}>
            <Trash2 size={12} />Excluir {selected.size}
          </Button>
        )}</div>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setShowCreate(true); setEditingId(null) }} disabled={isPending}>
          <Plus size={12} />Novo Grupo
        </Button>
      </div>

      {showCreate && (
        <GroupForm title="Novo Grupo" name={newName} slug={newSlug}
          onNameChange={handleNewName} onSlugChange={setNewSlug}
          onSave={saveCreate} onCancel={() => { setShowCreate(false); setNewName(''); setNewSlug('') }}
          isPending={isPending} />
      )}

      {items.length > 0 && (
        <div className="flex items-center gap-2 pb-1">
          <Checkbox checked={selected.size === items.length && items.length > 0} onCheckedChange={toggleAll} />
          <span className="text-xs text-muted-foreground">Selecionar todos</span>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(g => g.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {items.map((g) => (
              editingId === g.id ? (
                <GroupForm key={g.id} title="Editar Grupo" name={editName} slug={editSlug}
                  onNameChange={handleEditName} onSlugChange={setEditSlug}
                  onSave={saveEdit} onCancel={() => setEditingId(null)} isPending={isPending} />
              ) : (
                <SortableRow key={g.id} id={g.id}>
                  {(dragHandleProps) => (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectGroup(g)}>
                      <Checkbox checked={selected.has(g.id)} onCheckedChange={(v) => toggle(g.id, !!v)}
                        onClick={(e) => e.stopPropagation()} className="shrink-0" />
                      <span {...dragHandleProps} onClick={(e) => e.stopPropagation()}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0">
                        <GripVertical size={14} />
                      </span>
                      <span className="flex-1 text-sm font-medium">{g.name}</span>
                      <span className="text-xs text-muted-foreground">{g.slug}</span>
                      <div className="flex gap-1 items-center">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(g)}><Pencil size={12} /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => deleteSingle(g.id)}><Trash2 size={12} /></Button>
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground ml-1" />
                      </div>
                    </div>
                  )}
                </SortableRow>
              )
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && !showCreate && (
        <p className="text-sm text-center text-muted-foreground py-8">Nenhum grupo cadastrado.</p>
      )}
    </div>
  )
}

// ============================================================
// SUBGROUPS TAB
// ============================================================
function SubgroupsTab({ group, subgroups, onSelectSubgroup, onRefresh, onBack }: {
  group: ConfigGroup; subgroups: ConfigSubgroup[]
  onSelectSubgroup: (s: ConfigSubgroup) => void; onRefresh: () => void; onBack: () => void
}) {
  const [isPending, start] = useTransition()
  const filtered0 = subgroups.filter(s => s.group_id === group.id)
  const [items, setItems] = useState(filtered0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(s => s.id === active.id)
    const newIndex = items.findIndex(s => s.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
    start(async () => {
      const reordered = newItems.map((s, i) => ({ id: s.id, display_order: i + 1 }))
      const r = await reorderSubgroupsAction(reordered)
      if (!r.success) { toast({ title: 'Erro ao reordenar', variant: 'destructive' }); setItems(items) }
    })
  }

  const toggleAll = (v: boolean) => setSelected(v ? new Set(items.map(s => s.id)) : new Set())
  const toggle = (id: string, v: boolean) => {
    const next = new Set(selected); v ? next.add(id) : next.delete(id); setSelected(next)
  }

  function saveCreate() {
    if (!newName.trim()) return
    start(async () => {
      const r = await createSubgroupAction(group.id, newName.trim())
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Subgrupo criado' }); setShowCreate(false); setNewName(''); onRefresh()
    })
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return
    start(async () => {
      const r = await updateSubgroupAction(editingId, editName.trim())
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Subgrupo atualizado' }); setEditingId(null); onRefresh()
    })
  }

  function deleteSelected() {
    start(async () => {
      const r = await deleteSubgroupsAction([...selected])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: `${selected.size} subgrupo(s) excluído(s)` }); setSelected(new Set()); onRefresh()
    })
  }

  function deleteSingle(id: string) {
    start(async () => {
      const r = await deleteSubgroupsAction([id])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Subgrupo excluído' }); onRefresh()
    })
  }

  // sync after refresh
  const syncedItems = subgroups.filter(s => s.group_id === group.id)
  if (syncedItems.length !== items.length) setItems(syncedItems)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={onBack}>
          <ArrowLeft size={12} />Grupos
        </Button>
        <ChevronRight size={14} className="text-muted-foreground" />
        <span className="text-sm font-medium">{group.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>{selected.size > 0 && (
          <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={deleteSelected} disabled={isPending}>
            <Trash2 size={12} />Excluir {selected.size}
          </Button>
        )}</div>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setShowCreate(true); setEditingId(null) }} disabled={isPending}>
          <Plus size={12} />Novo Subgrupo
        </Button>
      </div>

      {showCreate && (
        <SubgroupForm title="Novo Subgrupo" name={newName} onNameChange={setNewName}
          onSave={saveCreate} onCancel={() => { setShowCreate(false); setNewName('') }} isPending={isPending} />
      )}

      {items.length > 0 && (
        <div className="flex items-center gap-2 pb-1">
          <Checkbox checked={selected.size === items.length && items.length > 0} onCheckedChange={toggleAll} />
          <span className="text-xs text-muted-foreground">Selecionar todos</span>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {items.map((s) => (
              editingId === s.id ? (
                <SubgroupForm key={s.id} title="Editar Subgrupo" name={editName} onNameChange={setEditName}
                  onSave={saveEdit} onCancel={() => setEditingId(null)} isPending={isPending} />
              ) : (
                <SortableRow key={s.id} id={s.id}>
                  {(dragHandleProps) => (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectSubgroup(s)}>
                      <Checkbox checked={selected.has(s.id)} onCheckedChange={(v) => toggle(s.id, !!v)}
                        onClick={(e) => e.stopPropagation()} className="shrink-0" />
                      <span {...dragHandleProps} onClick={(e) => e.stopPropagation()}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0">
                        <GripVertical size={14} />
                      </span>
                      <span className="flex-1 text-sm">{s.name}</span>
                      <div className="flex gap-1 items-center">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditingId(s.id); setEditName(s.name); setShowCreate(false) }}><Pencil size={12} /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => deleteSingle(s.id)}><Trash2 size={12} /></Button>
                        </div>
                        <ChevronRight size={14} className="text-muted-foreground ml-1" />
                      </div>
                    </div>
                  )}
                </SortableRow>
              )
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && !showCreate && (
        <p className="text-sm text-center text-muted-foreground py-8">Nenhum subgrupo em <strong>{group.name}</strong>.</p>
      )}
    </div>
  )
}

// ============================================================
// FIELDS TAB
// ============================================================
function FieldsTab({ group, subgroup, fields, onRefresh, onBack }: {
  group: ConfigGroup; subgroup: ConfigSubgroup; fields: ConfigField[]
  onRefresh: () => void; onBack: () => void
}) {
  const [isPending, start] = useTransition()
  const filtered0 = fields.filter(f => f.subgroup_id === subgroup.id)
  const [items, setItems] = useState(filtered0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editKey, setEditKey] = useState('')
  const [editOptions, setEditOptions] = useState<string[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newOptions, setNewOptions] = useState<string[]>([])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(f => f.id === active.id)
    const newIndex = items.findIndex(f => f.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
    start(async () => {
      const reordered = newItems.map((f, i) => ({ id: f.id, display_order: i + 1 }))
      const r = await reorderFieldsAction(reordered)
      if (!r.success) { toast({ title: 'Erro ao reordenar', variant: 'destructive' }); setItems(items) }
    })
  }

  const toggleAll = (v: boolean) => setSelected(v ? new Set(items.map(f => f.id)) : new Set())
  const toggle = (id: string, v: boolean) => {
    const next = new Set(selected); v ? next.add(id) : next.delete(id); setSelected(next)
  }

  function startEdit(f: ConfigField) {
    setEditingId(f.id); setEditName(f.name); setEditKey(f.field_key ?? ''); setEditOptions([...f.options]); setShowCreate(false)
  }

  function saveCreate() {
    if (!newName.trim()) return
    start(async () => {
      const r = await createFieldAction(subgroup.id, newName.trim(), newKey.trim(), newOptions)
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Campo criado' }); setShowCreate(false); setNewName(''); setNewKey(''); setNewOptions([]); onRefresh()
    })
  }

  function saveEdit() {
    if (!editingId || !editName.trim()) return
    start(async () => {
      const r = await updateFieldAction(editingId, editName.trim(), editKey.trim(), editOptions)
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Campo atualizado' }); setEditingId(null); onRefresh()
    })
  }

  function deleteSelected() {
    start(async () => {
      const r = await deleteFieldsAction([...selected])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: `${selected.size} campo(s) excluído(s)` }); setSelected(new Set()); onRefresh()
    })
  }

  function deleteSingle(id: string) {
    start(async () => {
      const r = await deleteFieldsAction([id])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Campo excluído' }); onRefresh()
    })
  }

  // sync after refresh
  const syncedItems = fields.filter(f => f.subgroup_id === subgroup.id)
  if (syncedItems.length !== items.length) setItems(syncedItems)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={onBack}>
          <ArrowLeft size={12} />{group.name}
        </Button>
        <ChevronRight size={14} className="text-muted-foreground" />
        <span className="text-sm font-medium">{subgroup.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>{selected.size > 0 && (
          <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={deleteSelected} disabled={isPending}>
            <Trash2 size={12} />Excluir {selected.size}
          </Button>
        )}</div>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setShowCreate(true); setEditingId(null) }} disabled={isPending}>
          <Plus size={12} />Novo Campo
        </Button>
      </div>

      {showCreate && (
        <FieldForm title="Novo Campo" name={newName} fieldKey={newKey} options={newOptions}
          onNameChange={setNewName} onKeyChange={setNewKey} onOptionsChange={setNewOptions}
          onSave={saveCreate} onCancel={() => { setShowCreate(false); setNewName(''); setNewKey(''); setNewOptions([]) }}
          isPending={isPending} />
      )}

      {items.length > 0 && (
        <div className="flex items-center gap-2 pb-1">
          <Checkbox checked={selected.size === items.length && items.length > 0} onCheckedChange={toggleAll} />
          <span className="text-xs text-muted-foreground">Selecionar todos</span>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {items.map((f) => (
              editingId === f.id ? (
                <FieldForm key={f.id} title="Editar Campo" name={editName} fieldKey={editKey} options={editOptions}
                  onNameChange={setEditName} onKeyChange={setEditKey} onOptionsChange={setEditOptions}
                  onSave={saveEdit} onCancel={() => setEditingId(null)} isPending={isPending} />
              ) : (
                <SortableRow key={f.id} id={f.id}>
                  {(dragHandleProps) => (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/40 transition-colors group">
                      <Checkbox checked={selected.has(f.id)} onCheckedChange={(v) => toggle(f.id, !!v)} className="shrink-0" />
                      <span {...dragHandleProps}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0">
                        <GripVertical size={14} />
                      </span>
                      <span className="flex-1 text-sm">{f.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {f.options.length > 0 ? `${f.options.length} opção(ões)` : (f.field_key ?? '')}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(f)}><Pencil size={12} /></Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => deleteSingle(f.id)}><Trash2 size={12} /></Button>
                      </div>
                    </div>
                  )}
                </SortableRow>
              )
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && !showCreate && (
        <p className="text-sm text-center text-muted-foreground py-8">Nenhum campo em <strong>{subgroup.name}</strong>.</p>
      )}
    </div>
  )
}

// ============================================================
// MAIN PANEL
// ============================================================
type Level = 'groups' | 'subgroups' | 'fields'

export function SettingsPanel({ initialGroups, initialSubgroups, initialFields }: Props) {
  const [groups, setGroups] = useState(initialGroups)
  const [subgroups, setSubgroups] = useState(initialSubgroups)
  const [fields, setFields] = useState(initialFields)
  const [selectedGroup, setSelectedGroup] = useState<ConfigGroup | null>(null)
  const [selectedSubgroup, setSelectedSubgroup] = useState<ConfigSubgroup | null>(null)
  const [, startRefresh] = useTransition()

  const level: Level = selectedSubgroup ? 'fields' : selectedGroup ? 'subgroups' : 'groups'

  const refresh = useCallback(() => {
    startRefresh(async () => {
      const { groups: g, subgroups: s, fields: f } = await getConfigDataAction()
      setGroups(g); setSubgroups(s); setFields(f)
    })
  }, [])

  const levelLabels: Record<Level, string> = { groups: 'Grupos', subgroups: 'Subgrupos', fields: 'Campos' }

  return (
    <div>
      <div className="flex gap-1 mb-6">
        {(['groups', 'subgroups', 'fields'] as Level[]).map((t, i) => {
          const active = level === t
          const clickable = t === 'groups' || (t === 'subgroups' && !!selectedGroup) || (t === 'fields' && !!selectedSubgroup)
          return (
            <span key={t} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="text-muted-foreground" />}
              <span onClick={() => {
                  if (!clickable) return
                  if (t === 'groups') { setSelectedGroup(null); setSelectedSubgroup(null) }
                  if (t === 'subgroups') setSelectedSubgroup(null)
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${active ? 'bg-primary text-primary-foreground' : clickable ? 'bg-muted hover:bg-muted/80 cursor-pointer' : 'text-muted-foreground'}`}>
                {levelLabels[t]}
              </span>
            </span>
          )
        })}
      </div>

      <Separator className="mb-6" />

      {level === 'groups' && (
        <GroupsTab groups={groups} onSelectGroup={(g) => { setSelectedGroup(g); setSelectedSubgroup(null) }} onRefresh={refresh} />
      )}
      {level === 'subgroups' && selectedGroup && (
        <SubgroupsTab group={selectedGroup} subgroups={subgroups} onSelectSubgroup={setSelectedSubgroup} onRefresh={refresh} onBack={() => setSelectedGroup(null)} />
      )}
      {level === 'fields' && selectedGroup && selectedSubgroup && (
        <FieldsTab group={selectedGroup} subgroup={selectedSubgroup} fields={fields} onRefresh={refresh} onBack={() => setSelectedSubgroup(null)} />
      )}
    </div>
  )
}
