'use client'

import { useState, useTransition } from 'react'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  Plus, Pencil, Trash2, Check, X, ChevronRight,
  GripVertical, ArrowLeft,
} from 'lucide-react'
import {
  createGroupAction, updateGroupAction, deleteGroupsAction,
  createSubgroupAction, updateSubgroupAction, deleteSubgroupsAction,
  createFieldAction, updateFieldAction, deleteFieldsAction,
} from '@/lib/actions/config'
import type { ConfigGroup, ConfigSubgroup, ConfigField } from '@/types/domain'

interface Props {
  initialGroups: ConfigGroup[]
  initialSubgroups: ConfigSubgroup[]
  initialFields: ConfigField[]
}

type Tab = 'groups' | 'subgroups' | 'fields'

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

// ============================================================
// Inline editable row
// ============================================================
function EditableRow({
  label,
  checked,
  onCheck,
  onEdit,
  onDelete,
  extra,
}: {
  label: string
  checked: boolean
  onCheck: (v: boolean) => void
  onEdit: () => void
  onDelete: () => void
  extra?: string
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/40 transition-colors group">
      <Checkbox checked={checked} onCheckedChange={onCheck} className="shrink-0" />
      <GripVertical size={14} className="text-muted-foreground shrink-0" />
      <span className="flex-1 text-sm truncate">{label}</span>
      {extra && <span className="text-xs text-muted-foreground truncate max-w-[120px]">{extra}</span>}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onEdit}>
          <Pencil size={12} />
        </Button>
        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// Modal/inline form
// ============================================================
function InlineForm({
  title,
  fields,
  onSave,
  onCancel,
}: {
  title: string
  fields: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }[]
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">{title}</p>
      {fields.map((f) => (
        <div key={f.label} className="space-y-1">
          <label className="text-xs text-muted-foreground">{f.label}</label>
          <Input
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            placeholder={f.placeholder}
            className="h-8 text-sm"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} className="h-7 text-xs gap-1">
          <Check size={12} /> Salvar
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="h-7 text-xs gap-1">
          <X size={12} /> Cancelar
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// OptionsEditor — editar array de strings
// ============================================================
function OptionsEditor({ options, onChange }: { options: string[]; onChange: (v: string[]) => void }) {
  const [newOption, setNewOption] = useState('')

  function add() {
    const trimmed = newOption.trim()
    if (!trimmed || options.includes(trimmed)) return
    onChange([...options, trimmed])
    setNewOption('')
  }

  function remove(idx: number) {
    onChange(options.filter((_, i) => i !== idx))
  }

  function edit(idx: number, val: string) {
    const next = [...options]
    next[idx] = val
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground">Opções</label>
      <div className="space-y-1">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-1">
            <Input
              value={opt}
              onChange={(e) => edit(i, e.target.value)}
              className="h-7 text-xs flex-1"
            />
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(i)}>
              <X size={11} />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Nova opção..."
          className="h-7 text-xs flex-1"
        />
        <Button size="icon" variant="outline" className="h-7 w-7" onClick={add}>
          <Plus size={11} />
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// GROUPS TAB
// ============================================================
function GroupsTab({
  groups,
  onSelectGroup,
  onRefresh,
}: {
  groups: ConfigGroup[]
  onSelectGroup: (g: ConfigGroup) => void
  onRefresh: () => void
}) {
  const [isPending, start] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')

  const toggleAll = (v: boolean) => setSelected(v ? new Set(groups.map(g => g.id)) : new Set())
  const toggle = (id: string, v: boolean) => {
    const next = new Set(selected)
    v ? next.add(id) : next.delete(id)
    setSelected(next)
  }

  function startEdit(g: ConfigGroup) {
    setEditingId(g.id)
    setEditName(g.name)
    setEditSlug(g.slug)
    setShowCreate(false)
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) return
    start(async () => {
      const r = await updateGroupAction(editingId, editName.trim(), editSlug.trim() || slugify(editName.trim()))
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Grupo atualizado' })
      setEditingId(null)
      onRefresh()
    })
  }

  async function saveCreate() {
    if (!newName.trim()) return
    start(async () => {
      const r = await createGroupAction(newName.trim(), newSlug.trim() || slugify(newName.trim()))
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Grupo criado' })
      setShowCreate(false)
      setNewName(''); setNewSlug('')
      onRefresh()
    })
  }

  async function deleteSelected() {
    if (!selected.size) return
    start(async () => {
      const r = await deleteGroupsAction([...selected])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: `${selected.size} grupo(s) excluído(s)` })
      setSelected(new Set())
      onRefresh()
    })
  }

  async function deleteSingle(id: string) {
    start(async () => {
      const r = await deleteGroupsAction([id])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Grupo excluído' })
      onRefresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={deleteSelected} disabled={isPending}>
              <Trash2 size={12} /> Excluir {selected.size}
            </Button>
          )}
        </div>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setShowCreate(true); setEditingId(null) }} disabled={isPending}>
          <Plus size={12} /> Novo Grupo
        </Button>
      </div>

      {showCreate && (
        <InlineForm
          title="Novo Grupo"
          fields={[
            { label: 'Nome', value: newName, onChange: (v) => { setNewName(v); setNewSlug(slugify(v)) }, placeholder: 'Ex: Imóveis' },
            { label: 'Slug', value: newSlug, onChange: setNewSlug, placeholder: 'Ex: imoveis' },
          ]}
          onSave={saveCreate}
          onCancel={() => { setShowCreate(false); setNewName(''); setNewSlug('') }}
        />
      )}

      {groups.length > 0 && (
        <div className="flex items-center gap-2 pb-1">
          <Checkbox
            checked={selected.size === groups.length && groups.length > 0}
            onCheckedChange={toggleAll}
          />
          <span className="text-xs text-muted-foreground">Selecionar todos</span>
        </div>
      )}

      <div className="space-y-1">
        {groups.map((g) => (
          <div key={g.id}>
            {editingId === g.id ? (
              <InlineForm
                title="Editar Grupo"
                fields={[
                  { label: 'Nome', value: editName, onChange: (v) => { setEditName(v); setEditSlug(slugify(v)) } },
                  { label: 'Slug', value: editSlug, onChange: setEditSlug },
                ]}
                onSave={saveEdit}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/40 transition-colors group cursor-pointer"
                onClick={() => onSelectGroup(g)}
              >
                <Checkbox
                  checked={selected.has(g.id)}
                  onCheckedChange={(v) => toggle(g.id, !!v)}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                />
                <GripVertical size={14} className="text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm font-medium">{g.name}</span>
                <span className="text-xs text-muted-foreground">{g.slug}</span>
                <div className="flex gap-1 items-center">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(g)}>
                      <Pencil size={12} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => deleteSingle(g.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground ml-1" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {groups.length === 0 && !showCreate && (
        <p className="text-sm text-center text-muted-foreground py-8">Nenhum grupo cadastrado.</p>
      )}
    </div>
  )
}

// ============================================================
// SUBGROUPS TAB
// ============================================================
function SubgroupsTab({
  group,
  subgroups,
  onSelectSubgroup,
  onRefresh,
  onBack,
}: {
  group: ConfigGroup
  subgroups: ConfigSubgroup[]
  onSelectSubgroup: (s: ConfigSubgroup) => void
  onRefresh: () => void
  onBack: () => void
}) {
  const [isPending, start] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')

  const filtered = subgroups.filter(s => s.group_id === group.id)
  const toggleAll = (v: boolean) => setSelected(v ? new Set(filtered.map(s => s.id)) : new Set())
  const toggle = (id: string, v: boolean) => {
    const next = new Set(selected)
    v ? next.add(id) : next.delete(id)
    setSelected(next)
  }

  async function saveCreate() {
    if (!newName.trim()) return
    start(async () => {
      const r = await createSubgroupAction(group.id, newName.trim())
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Subgrupo criado' })
      setShowCreate(false); setNewName('')
      onRefresh()
    })
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) return
    start(async () => {
      const r = await updateSubgroupAction(editingId, editName.trim())
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Subgrupo atualizado' })
      setEditingId(null)
      onRefresh()
    })
  }

  async function deleteSelected() {
    start(async () => {
      const r = await deleteSubgroupsAction([...selected])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: `${selected.size} subgrupo(s) excluído(s)` })
      setSelected(new Set())
      onRefresh()
    })
  }

  async function deleteSingle(id: string) {
    start(async () => {
      const r = await deleteSubgroupsAction([id])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Subgrupo excluído' })
      onRefresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={onBack}>
          <ArrowLeft size={12} /> Grupos
        </Button>
        <ChevronRight size={14} className="text-muted-foreground" />
        <span className="text-sm font-medium">{group.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {selected.size > 0 && (
            <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={deleteSelected} disabled={isPending}>
              <Trash2 size={12} /> Excluir {selected.size}
            </Button>
          )}
        </div>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setShowCreate(true); setEditingId(null) }} disabled={isPending}>
          <Plus size={12} /> Novo Subgrupo
        </Button>
      </div>

      {showCreate && (
        <InlineForm
          title="Novo Subgrupo"
          fields={[{ label: 'Nome', value: newName, onChange: setNewName, placeholder: 'Ex: Dados do Imóvel' }]}
          onSave={saveCreate}
          onCancel={() => { setShowCreate(false); setNewName('') }}
        />
      )}

      {filtered.length > 0 && (
        <div className="flex items-center gap-2 pb-1">
          <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
          <span className="text-xs text-muted-foreground">Selecionar todos</span>
        </div>
      )}

      <div className="space-y-1">
        {filtered.map((s) => (
          <div key={s.id}>
            {editingId === s.id ? (
              <InlineForm
                title="Editar Subgrupo"
                fields={[{ label: 'Nome', value: editName, onChange: setEditName }]}
                onSave={saveEdit}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted/40 transition-colors group cursor-pointer"
                onClick={() => onSelectSubgroup(s)}
              >
                <Checkbox checked={selected.has(s.id)} onCheckedChange={(v) => toggle(s.id, !!v)} onClick={(e) => e.stopPropagation()} className="shrink-0" />
                <GripVertical size={14} className="text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm">{s.name}</span>
                <div className="flex gap-1 items-center">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditingId(s.id); setEditName(s.name); setShowCreate(false) }}>
                      <Pencil size={12} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => deleteSingle(s.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground ml-1" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && !showCreate && (
        <p className="text-sm text-center text-muted-foreground py-8">Nenhum subgrupo em <strong>{group.name}</strong>.</p>
      )}
    </div>
  )
}

// ============================================================
// FIELDS TAB
// ============================================================
function FieldsTab({
  group,
  subgroup,
  fields,
  onRefresh,
  onBack,
}: {
  group: ConfigGroup
  subgroup: ConfigSubgroup
  fields: ConfigField[]
  onRefresh: () => void
  onBack: () => void
}) {
  const [isPending, start] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editKey, setEditKey] = useState('')
  const [editOptions, setEditOptions] = useState<string[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newOptions, setNewOptions] = useState<string[]>([])

  const filtered = fields.filter(f => f.subgroup_id === subgroup.id)
  const toggleAll = (v: boolean) => setSelected(v ? new Set(filtered.map(f => f.id)) : new Set())
  const toggle = (id: string, v: boolean) => {
    const next = new Set(selected)
    v ? next.add(id) : next.delete(id)
    setSelected(next)
  }

  function startEdit(f: ConfigField) {
    setEditingId(f.id)
    setEditName(f.name)
    setEditKey(f.field_key ?? '')
    setEditOptions([...f.options])
    setShowCreate(false)
  }

  async function saveCreate() {
    if (!newName.trim()) return
    start(async () => {
      const r = await createFieldAction(subgroup.id, newName.trim(), newKey.trim(), newOptions)
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Campo criado' })
      setShowCreate(false); setNewName(''); setNewKey(''); setNewOptions([])
      onRefresh()
    })
  }

  async function saveEdit() {
    if (!editingId || !editName.trim()) return
    start(async () => {
      const r = await updateFieldAction(editingId, editName.trim(), editKey.trim(), editOptions)
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Campo atualizado' })
      setEditingId(null)
      onRefresh()
    })
  }

  async function deleteSelected() {
    start(async () => {
      const r = await deleteFieldsAction([...selected])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: `${selected.size} campo(s) excluído(s)` })
      setSelected(new Set())
      onRefresh()
    })
  }

  async function deleteSingle(id: string) {
    start(async () => {
      const r = await deleteFieldsAction([id])
      if (!r.success) { toast({ title: 'Erro', description: r.error, variant: 'destructive' }); return }
      toast({ title: 'Campo excluído' })
      onRefresh()
    })
  }

  const CreateForm = () => (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">Novo Campo</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Nome</label>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Status Comercial" className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Chave (opcional)</label>
          <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Ex: commercial_status" className="h-8 text-sm" />
        </div>
      </div>
      <OptionsEditor options={newOptions} onChange={setNewOptions} />
      <div className="flex gap-2">
        <Button size="sm" onClick={saveCreate} className="h-7 text-xs gap-1" disabled={isPending}><Check size={12} /> Salvar</Button>
        <Button size="sm" variant="outline" onClick={() => { setShowCreate(false); setNewName(''); setNewKey(''); setNewOptions([]) }} className="h-7 text-xs gap-1"><X size={12} /> Cancelar</Button>
      </div>
    </div>
  )

  const EditForm = () => (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">Editar Campo</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Nome</label>
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Chave (opcional)</label>
          <Input value={editKey} onChange={(e) => setEditKey(e.target.value)} className="h-8 text-sm" />
        </div>
      </div>
      <OptionsEditor options={editOptions} onChange={setEditOptions} />
      <div className="flex gap-2">
        <Button size="sm" onClick={saveEdit} className="h-7 text-xs gap-1" disabled={isPending}><Check size={12} /> Salvar</Button>
        <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-7 text-xs gap-1"><X size={12} /> Cancelar</Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground" onClick={onBack}>
          <ArrowLeft size={12} /> {group.name}
        </Button>
        <ChevronRight size={14} className="text-muted-foreground" />
        <span className="text-sm font-medium">{subgroup.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {selected.size > 0 && (
            <Button size="sm" variant="destructive" className="h-7 text-xs gap-1" onClick={deleteSelected} disabled={isPending}>
              <Trash2 size={12} /> Excluir {selected.size}
            </Button>
          )}
        </div>
        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => { setShowCreate(true); setEditingId(null) }} disabled={isPending}>
          <Plus size={12} /> Novo Campo
        </Button>
      </div>

      {showCreate && <CreateForm />}

      {filtered.length > 0 && (
        <div className="flex items-center gap-2 pb-1">
          <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
          <span className="text-xs text-muted-foreground">Selecionar todos</span>
        </div>
      )}

      <div className="space-y-1">
        {filtered.map((f) => (
          <div key={f.id}>
            {editingId === f.id ? (
              <EditForm />
            ) : (
              <EditableRow
                label={f.name}
                extra={f.options.length > 0 ? `${f.options.length} opção(ões)` : f.field_key ?? ''}
                checked={selected.has(f.id)}
                onCheck={(v) => toggle(f.id, !!v)}
                onEdit={() => startEdit(f)}
                onDelete={() => deleteSingle(f.id)}
              />
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && !showCreate && (
        <p className="text-sm text-center text-muted-foreground py-8">Nenhum campo em <strong>{subgroup.name}</strong>.</p>
      )}
    </div>
  )
}

// ============================================================
// MAIN PANEL
// ============================================================
export function SettingsPanel({ initialGroups, initialSubgroups, initialFields }: Props) {
  const [groups, setGroups] = useState(initialGroups)
  const [subgroups, setSubgroups] = useState(initialSubgroups)
  const [fields, setFields] = useState(initialFields)
  const [selectedGroup, setSelectedGroup] = useState<ConfigGroup | null>(null)
  const [selectedSubgroup, setSelectedSubgroup] = useState<ConfigSubgroup | null>(null)
  const [, startRefresh] = useTransition()

  const level: Tab = selectedSubgroup ? 'fields' : selectedGroup ? 'subgroups' : 'groups'

  async function refresh() {
    startRefresh(async () => {
      const [{ getConfigGroups }, { getConfigSubgroups }, { getConfigFields }] = await Promise.all([
        import('@/lib/supabase/config.repo'),
        import('@/lib/supabase/config.repo'),
        import('@/lib/supabase/config.repo'),
      ])
      const [g, s, f] = await Promise.all([getConfigGroups(), getConfigSubgroups(), getConfigFields()])
      setGroups(g)
      setSubgroups(s)
      setFields(f)
    })
  }

  return (
    <div className="space-y-0">
      {/* Breadcrumb header */}
      <div className="flex gap-1 mb-6 text-sm">
        {(['groups', 'subgroups', 'fields'] as Tab[]).map((t, i) => {
          const labels: Record<Tab, string> = { groups: 'Grupos', subgroups: 'Subgrupos', fields: 'Campos' }
          const active = level === t
          const reachable = (t === 'groups') || (t === 'subgroups' && selectedGroup) || (t === 'fields' && selectedSubgroup)
          return (
            <span key={t} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="text-muted-foreground" />}
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer
                  ${active ? 'bg-primary text-primary-foreground' : reachable ? 'bg-muted hover:bg-muted/80 text-foreground' : 'text-muted-foreground cursor-default'}`}
                onClick={() => {
                  if (!reachable) return
                  if (t === 'groups') { setSelectedGroup(null); setSelectedSubgroup(null) }
                  if (t === 'subgroups') setSelectedSubgroup(null)
                }}
              >
                {labels[t]}
              </span>
            </span>
          )
        })}
      </div>

      <Separator className="mb-6" />

      {level === 'groups' && (
        <GroupsTab
          groups={groups}
          onSelectGroup={(g) => { setSelectedGroup(g); setSelectedSubgroup(null) }}
          onRefresh={refresh}
        />
      )}

      {level === 'subgroups' && selectedGroup && (
        <SubgroupsTab
          group={selectedGroup}
          subgroups={subgroups}
          onSelectSubgroup={setSelectedSubgroup}
          onRefresh={refresh}
          onBack={() => setSelectedGroup(null)}
        />
      )}

      {level === 'fields' && selectedGroup && selectedSubgroup && (
        <FieldsTab
          group={selectedGroup}
          subgroup={selectedSubgroup}
          fields={fields}
          onRefresh={refresh}
          onBack={() => setSelectedSubgroup(null)}
        />
      )}
    </div>
  )
}
