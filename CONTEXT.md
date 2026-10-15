# CONTEXT — El Tejaban

> Contexto vivo del proyecto. Última actualización: **2026-10-14**.
> El detalle técnico exhaustivo está en [`CLAUDE.md`](CLAUDE.md) y [`Documentacion/`](Documentacion/indice.md).

## Qué es

Instancia de la plataforma SaaS multi-restaurante (Next.js 16 App Router + Supabase)
para el restaurante **El Tejaban** (Morelia, Mich.). Es una **copia rebrandeada** del
repo base `mi-proyecto-copia`.

- `restaurant_id = 'tejaban'` — definido en `.env.local` como `NEXT_PUBLIC_RESTAURANT_ID=tejaban`.
- Comparte el mismo Supabase con `mi-proyecto-copia` (`'default'`) y `mi-restauranteportales`
  (`'portales'`). Aislamiento por columna `restaurant_id`; la tabla `settings` usa prefijo
  `tejaban:` en las claves.
- `npm run dev -- -p 3001` → `localhost:3001` (para correr junto al repo base en el 3000).
- **Este proyecto ya no tiene su propio login de administrador** (2026-09-12): `/admin*`
  reenvía a `mi-proyecto-copia`, que es el panel maestro de ambos restaurantes. Ver
  "Login de admin único" abajo. `/employee/*` y `/resta3/*` siguen con login propio.

## Login de admin único (2026-09-12)

- `middleware.ts`: cualquier ruta que empiece con `/admin` (login incluido) hace
  `307` a `${MASTER_ADMIN_URL}/admin/login` — env var en `.env.local`
  (`http://localhost:3000` en desarrollo; en producción **`https://mi-proyecto-copia.vercel.app`**,
  actualizado 2026-09-12 tras separar ese proyecto del compartido con NICHO).
- `app/api/auth/route.ts`: `POST` (login/registro de admin) responde `410`;
  `DELETE` (logout) se deja para limpiar cookies viejas.
- Las cuentas de `admins` con `restaurant_id='tejaban'` siguen en Supabase pero no
  se usan para iniciar sesión — el panel maestro autentica siempre contra
  `restaurant_id='caminos'` (antes `'default'`, corregido 2026-09-12 — ver
  `CONTEXT.md` de mi-proyecto-copia) y cambia de restaurante con un selector en el sidebar.

## Marca

- Paleta **azul + rojo** del logotipo de El Tejaban, sobre fondo **blanco**. Tema claro por defecto.
- Tokens en `app/globals.css`:
  - `--tj-*` — colores de marca (`--tj-blue #324A86`, `--tj-red #DA320D`, `--tj-bg #FFFFFF`…),
    con alias `--cm-*` retro-compatibles.
  - `--ad-*` — chrome de los paneles. `data-admin-theme` arranca en `'light'` (blanco);
    `'dark'` = azul marino `#131A2E`.
- Acento principal **`#324A86`** (azul).
- Logo: `public/logo.svg` + `app/icon.svg` (emblema: tejado rojo + letras azules).

## Menú (2026-09-09)

Sacado de la **carta digital oficial** de El Tejaban:
`https://eltejaban.last.shop/l/el-tejaban` (plataforma **last.app**).

- **79 platillos, 18 categorías** (Entradas, Tostadas, Quesadillas, Sopes, Chavindeca,
  Desayunos, Para los peques, Aves, Antojitos Mexicanos, Carne de Res, La especialidad
  de la casa, Caldos, Comida del Día, Mariscos (Entradas), Mariscos, Bebidas (sin alcohol),
  Bebidas (desayuno), Postres).
- Precios y descripciones tomados tal cual de su API. 3 platillos siguen `available:false`
  (agotados en la carta real): Requesón con Queso, Salsa de Requeson y Caldo de Pollo.
- **Fotos (actualizado 2026-10-14): los 79 platillos tienen foto propia, sin repetir**
  (79 archivos distintos en `public/menu/food/*.jpg`, 900×640).
  - 45 son **fotos del restaurante**, bajadas de su Cloudinary (`res.cloudinary.com/lastpos/...`).
  - 34 son de **Wikimedia Commons** (CC0 / CC BY / CC BY-SA) para los platillos que la carta
    de last.app no tiene con foto. Autor, licencia y enlace de cada una en
    `public/menu/food/CREDITOS.json` (las licencias BY piden dar crédito).
    Algunas son aproximadas (p. ej. Caldo de Iguana = caldo genérico); sustituibles
    por fotos reales desde el admin.
  - Ya **no** se usan las tarjetas de categoría `public/menu/cat-*.svg` (se conservan como respaldo).
  - `scripts/menu-el-tejaban.json` tiene las mismas rutas → re-sembrar no las pierde.
- `settings`: `tejaban:restaurant_name` = "El Tejaban",
  `tejaban:restaurant_address` = "María Rodríguez del Toro de Lazarín 6-D, Bocanegra, 58000 Morelia, Mich.",
  `tejaban:restaurant_phone` = "+52 443 255 3627".

### Pipeline del menú (`scripts/`)

| Script | Función |
|---|---|
| `tej-api.json` | respuesta cruda de la API `api.last.app/storefront/locations/{loc}/catalog/{cat}` |
| `build-menu-el-tejaban.mjs` | `tej-api.json` → `menu-el-tejaban.json` (fuente editable) |
| `fetch-menu-images.mjs` | baja las fotos del restaurante a `public/menu/food/` |
| `gen-menu-images.mjs` | genera tarjetas talavera azul/rojo `public/menu/cat-*.svg` |
| `seed-menu-el-tejaban.mjs` | borra y re-inserta el menú de `'tejaban'` en Supabase + fija settings |

Para re-sincronizar si El Tejaban cambia su carta: volver a bajar `tej-api.json`
(IDs `locationId=0a54f5ce-bacb-4a06-93b0-ee03d74f63ed`, `catalogId=8aefcd1e-159b-42ec-946f-b1ebb77a45ec`)
y correr build → fetch → seed.

- **Pago a domicilio (2026-09-12):** `/menu` ofrece 3 formas de pago para pedidos "A
  domicilio" — Stripe, Depósito y **Transferencia** (nueva). `PayMethod` en
  `app/menu/page.tsx` incluye `'transferencia'`; se guarda en las notas del pedido
  (`Pago: Transferencia`).

## Superadmin y BD propia (2026-10-12)

- `mi-superadmindrestaurante` tiene chip "El Tejaban" en Feature Flags y Permisos
  (claves `feature_flags_tejaban`, `employee_permissions_tejaban`, `user_permissions_tejaban`).
- Hay llaves de un Supabase propio de El Tejaban pero falta su URL; mientras tanto todo
  sigue en la BD compartida (`zxynrlqubdlrwcfoewdv`). SQL listo en `supabase/`
  (`tejaban-1-esquema.sql`, `tejaban-2-datos.sql`). Detalle en `CLAUDE.md`.

## Estado

- Copiado sin `.git`, `node_modules`, `.next`, `.vercel`, `.claude`. Sin
  `.github/workflows/sync-portales.yml` (no debe sincronizar con portales).
- **GitHub (2026-10-14):** repo **público** `Segundo715/mi-restaurantetejaban`, rama `main`.
  Por ser público, `.gitignore` excluye `.env*`, `.vercel` y `supabase/` (el SQL de datos
  trae teléfonos y hashes de contraseñas). El deploy sigue siendo manual con `vercel --prod`
  (Vercel no está conectado al repo).
- **Producción:** `https://mi-restaurantetejaban.vercel.app`. `/admin` reenvía a
  `https://mi-proyecto-copia.vercel.app/admin/login` (panel maestro, ver arriba).
- `npm run build` → OK. Los snapshots `documentacion-completa-*` y `documentacion-markdown.md`
  son de junio 2026 (heredados del repo base); solo se les actualizó marca y tenant.
