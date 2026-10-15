/**
 * Convierte el catálogo real de El Tejaban (API last.app) en
 * scripts/menu-el-tejaban.json  ->  [{ category, name, description, price, available, imageId }]
 *
 * Entrada: scripts/tej-api.json  (respuesta de
 *   https://api.last.app/storefront/locations/0a54f5ce-bacb-4a06-93b0-ee03d74f63ed/catalog/8aefcd1e-159b-42ec-946f-b1ebb77a45ec )
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DIR = dirname(fileURLToPath(import.meta.url))
const cat = JSON.parse(readFileSync(join(DIR, 'tej-api.json'), 'utf8'))

const items = cat.items // { id: {...} }
const out = []
for (const c of cat.categories) {
  for (const id of c.items || []) {
    const it = items[id]
    if (!it || it.itemType !== 'product') continue
    out.push({
      category: c.name.trim(),
      name: it.name.trim(),
      description: (it.description || '').trim(),
      price: Math.round((it.price ?? 0)) / 100,
      available: !it.outOfStock,
      imageId: it.imageId || null,
    })
  }
}

writeFileSync(join(DIR, 'menu-el-tejaban.json'), JSON.stringify(out, null, 2) + '\n')
const cats = [...new Set(out.map(o => o.category))]
console.log(`items: ${out.length} | categorías: ${cats.length}`)
console.log('con imagen:', out.filter(o => o.imageId).length, '| agotados:', out.filter(o => !o.available).length)
console.log(cats.join(' · '))
