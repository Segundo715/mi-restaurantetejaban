/**
 * Reemplaza el menú de El Tejaban (restaurant_id = 'tejaban') en Supabase
 * con scripts/menu-el-tejaban.json. También fija restaurant_name / address /
 * phone en settings (prefijo tejaban:).
 *
 *   node --env-file=.env.local scripts/seed-menu-el-tejaban.mjs
 *   node --env-file=.env.local scripts/seed-menu-el-tejaban.mjs --dry
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const DIR = dirname(fileURLToPath(import.meta.url))
const RID = 'tejaban'
const DRY = process.argv.includes('--dry')

const strip = s => (s ?? '').replace(new RegExp('^' + String.fromCharCode(65279)), '').trim()
const url = strip(process.env.NEXT_PUBLIC_SUPABASE_URL)
const key = strip(process.env.SUPABASE_SERVICE_KEY) || strip(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
if (!url || !key) { console.error('Faltan credenciales de Supabase en .env.local'); process.exit(1) }
const sb = createClient(url, key)

const items = JSON.parse(readFileSync(join(DIR, 'menu-el-tejaban.json'), 'utf8'))
const catSlug = c => c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const nameSlug = catSlug

// Platillos sin foto propia que quedan bien reutilizando la de otro platillo.
const REUSE = {
  'Salsa de Requeson': 'requeson-con-queso',
  'Quesadilla Sencilla': 'quesadilla-con-guisado',
  'Sope Sencillo': 'sope-con-guisado',
  'Enmoladas Al Gusto': 'mole',
  'Caldo de Iguana': 'churipo',
  'Empanadillas': 'tostada-de-marisco',
  'Limonada Flotante': 'limonada',
  'Coca-Cola flotante': 'limonada',
  'Rusa': 'limonada',
  'Mentirosa': 'limonada',
  'Sangria fresca': 'naranjada',
  'Jugo de Zanahoria': 'jugo-de-naranja',
  'Jarra de Agua': 'vaso-agua-de-sabor',
  'Agua Mineral en Infusión': 'vaso-agua-de-sabor',
  'Nescafe': 'cafe-de-olla',
  'Chocolate': 'cafe-de-olla',
  'Duraznos en almíbar': 'gelatina',
  'gelatina preparada': 'gelatina',
  'Arroz con leche': 'chongos',
  'Pay de Queso': 'chongos',
  'menudo': 'caldo-de-res',
}

function imageFor(it) {
  if (it.image) return it.image
  if (REUSE[it.name]) return `/menu/food/${REUSE[it.name]}.jpg`
  return `/menu/cat-${catSlug(it.category)}.svg`
}

const cats = [...new Set(items.map(i => i.category))]
console.log(`\nMenú El Tejaban — ${items.length} platillos en ${cats.length} categorías`)
const conFoto = items.filter(i => i.image || REUSE[i.name]).length
console.log(`  foto propia/reutilizada: ${conFoto}  ·  tarjeta de categoría: ${items.length - conFoto}  ·  agotados: ${items.filter(i => !i.available).length}`)
if (DRY) { console.log('\n--dry: sin cambios.\n'); process.exit(0) }

// settings (prefijo tejaban:)
for (const [k, v] of [
  ['restaurant_name', 'El Tejaban'],
  ['restaurant_address', 'María Rodríguez del Toro de Lazarín 6-D, Bocanegra, 58000 Morelia, Mich.'],
  ['restaurant_phone', '+52 443 255 3627'],
]) {
  const { error } = await sb.from('settings').upsert({ key: `${RID}:${k}`, value: v }, { onConflict: 'key' })
  if (error) console.log(`  settings ${k}: ${error.message}`)
}
console.log('  ✅  settings (nombre, dirección, teléfono)')

// menú: borrar y re-insertar
const { data: prev } = await sb.from('menu_items').select('id').eq('restaurant_id', RID)
if (prev?.length) {
  await sb.from('menu_items').delete().eq('restaurant_id', RID)
  console.log(`  🗑  ${prev.length} platillos anteriores eliminados`)
}
const base = Date.now()
const rows = items.map((it, i) => ({
  name: it.name,
  description: it.description ?? '',
  price: it.price,
  category: it.category,
  image_url: imageFor(it),
  available: it.available !== false,
  likes: 0,
  restaurant_id: RID,
  created_at: new Date(base + i * 1000).toISOString(),
}))
for (let i = 0; i < rows.length; i += 50) {
  const { error } = await sb.from('menu_items').insert(rows.slice(i, i + 50))
  if (error) { console.error('insert:', error.message); process.exit(1) }
  console.log(`   ✅  ${Math.min(i + 50, rows.length)}/${rows.length}`)
}
console.log('\n✔  Menú de El Tejaban cargado. Revisa http://localhost:3001/menu\n')
