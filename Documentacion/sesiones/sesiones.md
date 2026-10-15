# Registro de sesiones — El Tejaban

Bitácora de cambios grandes por sesión de trabajo. La más reciente arriba.

---

## 2026-10-14 — Fotos únicas para todo el menú + repo en GitHub

- **Fotos del menú:** los 79 platillos tienen ahora foto propia, sin repetir.
  - 13 platillos que tenían tarjeta de categoría (`cat-*.svg`) y 8 que tomaban prestada
    una foto equivocada (p. ej. Pay de Queso con la de chongos) recibieron foto nueva.
  - Después, los 13 que todavía compartían foto con otro platillo (bebidas, Enmoladas,
    Caldo de Iguana, Salsa de Requeson, Quesadilla/Sope Sencillo, Duraznos…) también.
  - Origen: Wikimedia Commons (licencias CC), recortadas a 900×640 con `sharp`.
    Créditos en `public/menu/food/CREDITOS.json`.
  - Actualizado `image_url` en Supabase (`restaurant_id='tejaban'`) y el campo `image`
    de `scripts/menu-el-tejaban.json`. Verificado: 79 platillos, 79 imágenes distintas,
    0 rotas en producción.
- **Agotados:** siguen 3 (`Requesón con Queso`, `Salsa de Requeson`, `Caldo de Pollo`).
  No se reactivaron — falta confirmación del usuario.
- **Admin:** se aclaró que `/admin` reenvía a `mi-proyecto-copia.vercel.app` a propósito
  (login de admin único, 2026-09-12).
- **GitHub:** el proyecto se volvió repo git y se subió como repo **público**
  `Segundo715/mi-restaurantetejaban`. `.gitignore` ahora excluye `supabase/` además de `.env*`.
- Deploy con `vercel --prod`.

## 2026-09-12 — URL del panel maestro actualizada (incidente en mi-proyecto-copia)

- `mi-proyecto-copia` (el panel maestro) compartía por error el proyecto de Vercel
  y el `restaurant_id='default'` con `/c/Users/pepit/mi-proyecto` (NICHO), un
  proyecto hermano no relacionado con El Tejaban. Se separaron: Caminos de
  Michoacán pasó a `restaurant_id='caminos'` y a su propio proyecto de Vercel,
  **`https://mi-proyecto-copia.vercel.app`** (antes `mi-proyecto-phi-ecru.vercel.app`,
  que ahora es NICHO otra vez). Detalle completo en el `CONTEXT.md` de mi-proyecto-copia.
- **`MASTER_ADMIN_URL` de producción actualizado** a `https://mi-proyecto-copia.vercel.app`
  (antes apuntaba al dominio compartido con NICHO). Redeployado y verificado:
  `/admin/login` de este proyecto sigue reenviando correctamente al panel maestro.
- Sin cambios de código en este repo — solo el valor de la env var en Vercel.

## 2026-09-12 — Forma de pago "Transferencia" en checkout de domicilio

- `/menu` → pedido "A domicilio": se agregó **Transferencia** como tercera forma de
  pago junto a Stripe y Depósito. `type PayMethod` en `app/menu/page.tsx` pasa a
  `'stripe' | 'deposito' | 'transferencia'`; grid de `grid-cols-2` a `grid-cols-3`
  con ícono de flechas de intercambio. Mismo cambio hecho en `mi-proyecto-copia`
  (repo base) — aquí solo se tocó la lógica, los colores de marca (azul/rojo) no
  cambiaron.
- Se guarda en `notes` del pedido (`Pago: Transferencia`); texto de ayuda igual al
  de Stripe. `npx tsc --noEmit` y `npm run lint app/menu/page.tsx` → OK.

## 2026-09-12 — Se retira el login de admin propio (panel maestro único)

- `mi-proyecto-copia` es el panel maestro: un solo login administra tanto Caminos
  de Michoacán como El Tejaban con un selector de restaurante en el sidebar. Tener
  además el `/admin/login` de este repo funcionando era, de facto, un segundo login.
- `middleware.ts`: toda ruta `/admin*` (login incluido, se quitó la excepción) hace
  `307` a `${MASTER_ADMIN_URL}/admin/login` (nueva env var en `.env.local`, default
  `http://localhost:3000`).
- `app/api/auth/route.ts`: `POST` ahora responde `410` con el link al login del
  maestro; `DELETE` (logout) se deja igual.
- `/employee/login` y `/resta3/login` de este proyecto no se tocaron — siguen
  siendo audiencias separadas con su propio login.
- Verificado por curl: `/admin`, `/admin/login`, `/admin/menu` en `localhost:3001`
  → 307 a `localhost:3000/admin/login`; `POST /api/auth` → 410;
  `/employee/login` sigue en 200. `npx tsc --noEmit` y `npm run lint` (archivos
  tocados) → OK.

## 2026-09-09 — Menú real desde last.app

- **Menú oficial de El Tejaban** cargado en Supabase (`restaurant_id='tejaban'`),
  extraído de su carta digital `https://eltejaban.last.shop/l/el-tejaban`:
  79 platillos, 18 categorías, con precios y descripciones tal cual de su API
  (`api.last.app/storefront/locations/…/catalog/…`).
- 3 platillos quedaron marcados como agotados (como en la carta real).
- **45 fotos propias del restaurante** bajadas de su Cloudinary a
  `public/menu/food/*.jpg`. 21 sin foto reutilizan la de un platillo equivalente,
  13 usan tarjeta de categoría azul/rojo (`public/menu/cat-*.svg`).
- `settings` (prefijo `tejaban:`): nombre "El Tejaban", dirección (Morelia) y
  teléfono `+52 443 255 3627`.
- Pipeline en `scripts/`: `build-menu-el-tejaban.mjs` → `fetch-menu-images.mjs`
  → `gen-menu-images.mjs` → `seed-menu-el-tejaban.mjs`. Fuente cruda: `tej-api.json`.
- Documentación: se recrearon `CONTEXT.md` y esta bitácora.

## 2026-09-07 — Creación del proyecto (copia rebrandeada)

- `mi-restaurantetejaban` creado como **copia** de `mi-proyecto-copia` (repo base),
  rebrandeada al restaurante El Tejaban. Tercer tenant junto a `'default'` y `'portales'`.
- `.env.local`: `NEXT_PUBLIC_RESTAURANT_ID=tejaban`.
- Paleta azul `#324A86` + rojo `#DA320D` sobre blanco; tema claro por defecto.
  Tokens `--tj-*` (alias `--cm-*`) y `--ad-*` en `app/globals.css`.
- Logo `public/logo.svg` + `app/icon.svg` (emblema El Tejaban).
- Sweep sobre `app/ components/ lib/` mapeando la paleta café de Caminos → azul/rojo,
  y "Caminos de Michoacán" → "El Tejaban".
- Se copió sin `.git`, `node_modules`, `.next`, `.vercel`, `.claude`; se borró
  `.github/workflows/sync-portales.yml`. `npm run build` → OK.
