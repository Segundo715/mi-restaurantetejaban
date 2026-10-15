/**
 * Descarga las fotos de los platillos de El Tejaban (Cloudinary de last.app)
 * a public/menu/food/<slug>.jpg y fija el campo "image" de scripts/menu-el-tejaban.json.
 *
 *   node scripts/fetch-menu-images.mjs
 *   node --env-file=.env.local scripts/seed-menu-el-tejaban.mjs
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const FOOD = join(ROOT, 'public', 'menu', 'food')
mkdirSync(FOOD, { recursive: true })
const JSON_PATH = join(ROOT, 'scripts', 'menu-el-tejaban.json')

const CLD = id => `https://res.cloudinary.com/lastpos/image/upload/f_jpg,q_78,w_900,h_640,c_fill/${id}`
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const sleep = ms => new Promise(r => setTimeout(r, ms))

const items = JSON.parse(readFileSync(JSON_PATH, 'utf8'))
const withImg = items.filter(i => i.imageId)
console.log(`\nDescargando ${withImg.length} fotos a public/menu/food/ ...\n`)

let ok = 0
for (const it of withImg) {
  const sl = slug(it.name)
  const dest = join(FOOD, sl + '.jpg')
  if (existsSync(dest)) { it.image = `/menu/food/${sl}.jpg`; ok++; console.log('  skip ' + sl); continue }
  try {
    const res = await fetch(CLD(it.imageId), { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/jpeg,image/*' } })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const buf = Buffer.from(await res.arrayBuffer())
    writeFileSync(dest, buf)
    it.image = `/menu/food/${sl}.jpg`
    ok++
    console.log('  OK  ' + sl + '  (' + (buf.length / 1024 | 0) + ' KB)')
  } catch (e) {
    console.log('  x   ' + sl + '  (' + e.message + ')')
  }
  await sleep(120)
}

for (const it of items) delete it.imageId
writeFileSync(JSON_PATH, JSON.stringify(items, null, 2) + '\n')
console.log(`\n${ok}/${withImg.length} descargadas. ${items.length - ok} platillos sin foto (usan un ícono de categoría).`)
console.log('\nAhora: node --env-file=.env.local scripts/seed-menu-el-tejaban.mjs\n')
