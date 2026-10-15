// Carga el recetario de 'tejaban' (antes vacío) con recetas de platillos que sí
// están en scripts/menu-el-tejaban.json.
// Ejecutar: node --env-file=.env.local scripts/seed-recipes-tejaban.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const recipes = JSON.parse(readFileSync(new URL('./recipes-tejaban.json', import.meta.url)))
const menu = JSON.parse(readFileSync(new URL('./menu-el-tejaban.json', import.meta.url)))
const menuByName = new Map(menu.map(m => [m.name, m]))

const { error: delErr } = await sb.from('recipes').delete().eq('restaurant_id', 'tejaban')
if (delErr) { console.error('Error borrando recetas viejas:', delErr.message); process.exit(1) }

const rows = recipes.map(r => {
  const m = menuByName.get(r.name)
  return {
    name: r.name,
    description: r.description,
    category: r.category,
    ingredients: r.ingredients,
    steps: r.steps,
    image_url: m?.image ?? null,
    restaurant_id: 'tejaban',
  }
})

const { error } = await sb.from('recipes').insert(rows)
if (error) { console.error('Error insertando recetas:', error.message); process.exit(1) }

console.log(`✅ ${rows.length} recetas de El Tejaban insertadas.`)
