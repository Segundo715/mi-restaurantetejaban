// Alias de /resetas aún sin implementar; muestra un placeholder "Próximamente".
// La ruta activa con branding completo es app/resetas/page.tsx.
export default function RecetasPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5" style={{ backgroundColor: '#ffffff' }}>
      <img src="/logo.svg" alt="Logo" className="h-16 w-auto mb-4" />
      <h1 className="text-xl font-black" style={{ color: '#1c2540' }}>Recetas</h1>
      <p className="text-sm mt-1" style={{ color: '#324a86' }}>Próximamente</p>
    </div>
  )
}
