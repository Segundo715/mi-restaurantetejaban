/**
 * Genera una tarjeta de categoría estilo talavera (azul/rojo de El Tejaban)
 * por cada categoría del menú, en public/menu/cat-<slug>.svg
 * Se usan como imagen de respaldo para los platillos sin foto propia.
 *
 *   node scripts/gen-menu-images.mjs
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DIR = dirname(fileURLToPath(import.meta.url))
const OUT = join(DIR, '..', 'public', 'menu')
mkdirSync(OUT, { recursive: true })

const BG = '#ffffff'
const BG2 = '#f4f6fb'
const AZUL = '#324a86'
const AZUL_OSC = '#31477f'
const ROJO = '#da320d'
const ROJO_CLARO = '#e2653f'
const TEXTO = '#1c2540'
const FLOR = [AZUL, ROJO, AZUL_OSC, ROJO_CLARO]

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const items = JSON.parse(readFileSync(join(DIR, 'menu-el-tejaban.json'), 'utf8'))
const CATS = [...new Set(items.map(i => i.category))]

const W = 1200, H = 500

function flor(x, y, color) {
  return `<g transform="translate(${x} ${y})" fill="${color}">
    <circle cx="0" cy="-13" r="9"/><circle cx="0" cy="13" r="9"/>
    <circle cx="-13" cy="0" r="9"/><circle cx="13" cy="0" r="9"/>
    <circle cx="-9" cy="-9" r="4"/><circle cx="9" cy="-9" r="4"/>
    <circle cx="-9" cy="9" r="4"/><circle cx="9" cy="9" r="4"/>
    <circle cx="0" cy="0" r="7.5" fill="${BG2}"/><circle cx="0" cy="0" r="3.5"/>
  </g>`
}
function cenefa(y) {
  let s = ''
  let i = 0
  for (let x = 60; x < W; x += 150, i++) {
    s += flor(x, y, FLOR[i % FLOR.length])
    s += `<g fill="${ROJO}" opacity="0.7">
      <circle cx="${x + 75}" cy="${y - 6}" r="2.5"/><circle cx="${x + 75}" cy="${y + 2}" r="2.5"/>
      <circle cx="${x + 68}" cy="${y - 2}" r="2.5"/><circle cx="${x + 82}" cy="${y - 2}" r="2.5"/></g>`
  }
  return s
}
function filete(y) {
  const cx = W / 2
  return `<g stroke="${AZUL}" stroke-width="2" opacity="0.8">
    <line x1="${cx - 300}" y1="${y}" x2="${cx - 26}" y2="${y}"/>
    <line x1="${cx + 26}" y1="${y}" x2="${cx + 300}" y2="${y}"/></g>
  <path d="M${cx} ${y - 9} L${cx + 9} ${y} L${cx} ${y + 9} L${cx - 9} ${y} Z" fill="${ROJO}"/>`
}
function svg(nombre) {
  const cy = H / 2 - 6
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Georgia, 'Times New Roman', serif">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${AZUL}" stroke-width="2" opacity="0.3"/>
  ${cenefa(60)}${cenefa(H - 60)}
  ${filete(cy - 62)}
  <text x="${W / 2}" y="${cy}" text-anchor="middle" font-size="66" font-weight="bold" fill="${AZUL}" letter-spacing="3" dominant-baseline="middle">${nombre.toUpperCase()}</text>
  ${filete(cy + 58)}
  <text x="${W / 2}" y="${cy + 104}" text-anchor="middle" font-size="23" fill="${TEXTO}" letter-spacing="7" opacity="0.7">EL TEJABAN</text>
</svg>`
}

for (const c of CATS) {
  writeFileSync(join(OUT, `cat-${slug(c)}.svg`), svg(c))
  console.log(`  cat-${slug(c)}.svg  (${c})`)
}
console.log(`\n${CATS.length} tarjetas de categoría generadas.`)
