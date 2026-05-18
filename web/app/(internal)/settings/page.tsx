import { Settings2 } from 'lucide-react'
import { getAllConfig } from '@/lib/supabase/config.repo'
import { SettingsPanel } from '@/components/settings/SettingsPanel'

export default async function SettingsPage() {
  const { groups, subgroups, fields } = await getAllConfig()

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings2 size={22} className="text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie grupos, subgrupos e campos do sistema
          </p>
        </div>
      </div>

      <SettingsPanel
        initialGroups={groups}
        initialSubgroups={subgroups}
        initialFields={fields}
      />
    </div>
  )
}
