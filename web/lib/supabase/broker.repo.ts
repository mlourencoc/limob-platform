// src/lib/supabase/broker.repo.ts

import { createClient } from './server'
import type { Broker, BrokerInsert, BrokerUpdate } from '@/types/domain'

export async function getBrokers(): Promise<Broker[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('brokers')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw new Error(`getBrokers: ${error.message}`)
  return (data ?? []) as Broker[]
}

export async function getBrokerById(id: string): Promise<Broker | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('brokers').select('*').eq('id', id).single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(`getBrokerById: ${error.message}`)
  }
  return data as Broker
}

export async function createBroker(input: BrokerInsert): Promise<Broker> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from('brokers').insert(input as any).select().single()
  if (error) throw new Error(`createBroker: ${error.message}`)
  return data as Broker
}

export async function updateBroker(id: string, input: BrokerUpdate): Promise<Broker> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.from('brokers').update(input as any).eq('id', id).select().single()
  if (error) throw new Error(`updateBroker: ${error.message}`)
  return data as Broker
}
