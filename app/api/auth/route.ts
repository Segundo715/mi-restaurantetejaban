import { NextResponse } from 'next/server'

// El login/registro de administrador se unificó en el panel maestro
// (mi-proyecto-copia): ya no existe un segundo login de admin aquí. Un admin
// autenticado allá cambia a "El Tejaban" con el selector del sidebar sin
// volver a loguearse. Este endpoint solo permite cerrar sesión de una cookie
// vieja; POST queda deshabilitado a propósito.
export async function POST() {
  const masterUrl = process.env.MASTER_ADMIN_URL || 'http://localhost:3000'
  return NextResponse.json(
    { error: 'El login de administrador se unificó en el panel maestro.', masterUrl: `${masterUrl}/admin/login` },
    { status: 410 }
  )
}

// Cierra sesión eliminando ambas cookies.
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', '', { path: '/', maxAge: 0 })
  res.cookies.set('admin_name', '', { path: '/', maxAge: 0 })
  return res
}
