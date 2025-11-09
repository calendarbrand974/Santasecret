// Cette page est maintenant redirigée vers /app/draw
import { redirect } from 'next/navigation'

export default function TargetPage() {
  redirect('/app/draw')
}

