// src/components/layout/AppShell.tsx
// Layout base com sidebar lateral fixa.
// Uso: wrapping nas páginas internas via layout.tsx de cada grupo de rotas.

import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <Header />
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
