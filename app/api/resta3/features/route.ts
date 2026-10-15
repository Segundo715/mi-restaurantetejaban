import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const RESTA3_FEATURES = ['r3_dashboard','r3_tpv','r3_mesas','r3_cocina','r3_inventario','r3_compras','r3_empleados','r3_reportes']

export async function GET() {
  // El SuperAdmin guarda R1 + Resta3 juntos en feature_flags_<rid> (en la BD propia del
  // restaurante, sin sufijo: feature_flags). Se toma la primera clave que traiga flags r3_*;
  // si ninguna, se cae a feature_flags_resta3 (global).
  const rid = process.env.NEXT_PUBLIC_RESTAURANT_ID
  const keys = rid ? [`feature_flags_${rid}`, 'feature_flags', 'feature_flags_resta3'] : ['feature_flags_resta3']

  const { data } = await supabase.from('settings').select('key, value').in('key', keys)

  let overrides: Record<string, boolean> = {}
  for (const key of keys) {
    const row = data?.find(r => r.key === key)
    if (!row?.value) continue
    const parsed: Record<string, boolean> = typeof row.value === 'string' ? JSON.parse(row.value) : row.value
    if (RESTA3_FEATURES.some(k => k in parsed)) { overrides = parsed; break }
  }
  // Si un flag no está en Supabase, se habilita por defecto.
  const flags = Object.fromEntries(RESTA3_FEATURES.map(k => [k, overrides[k] ?? true]))

  return Response.json(flags, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
  })
}
