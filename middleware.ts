import { NextRequest, NextResponse } from 'next/server'

// Verifica que la cookie de sesión sea auténtica recomputando el HMAC.
// Formato del token: "<adminId>.<hmac_sha256(adminId)>"
// Se usa Web Crypto API porque el middleware corre en Edge Runtime (no Node.js).
async function verifySession(session: string | undefined): Promise<boolean> {
  if (!session) return false
  const dot = session.lastIndexOf('.')
  if (dot === -1) return false
  const id = session.slice(0, dot)
  const sig = session.slice(dot + 1)
  if (!id) return false
  const secret = process.env.ADMIN_SECRET ?? 'dev-secret'
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const computed = await crypto.subtle.sign('HMAC', key, enc.encode(id))
  const expected = Array.from(new Uint8Array(computed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return sig === expected
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // El login de administrador se unificó en el panel maestro (mi-proyecto-copia):
  // ya no hay un segundo /admin/login aquí. Cualquier ruta /admin de este proyecto
  // (login incluido) reenvía al panel maestro; un admin ya logueado allá cambia a
  // "El Tejaban" con el selector del sidebar, sin loguearse dos veces.
  if (pathname.startsWith('/admin')) {
    const masterUrl = process.env.MASTER_ADMIN_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${masterUrl}/admin/login`)
  }

  // Protege todas las rutas /employee excepto la página de login.
  if (pathname.startsWith('/employee') && pathname !== '/employee/login') {
    const session = req.cookies.get('employee_session')?.value
    if (!await verifySession(session))
      return NextResponse.redirect(new URL('/employee/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Solo ejecutamos el middleware en las rutas que realmente necesitan protección.
  matcher: ['/admin', '/admin/:path*', '/employee', '/employee/:path*'],
}
