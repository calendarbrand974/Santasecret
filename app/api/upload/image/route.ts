import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/rbac'

// Forcer Node.js runtime (requis pour Prisma en serverless)
export const runtime = 'nodejs'
// Empêcher la précompilation (évite les requêtes DB pendant le build)
export const dynamic = 'force-dynamic'
// Désactiver la mise en cache (évite SSG/ISR)
export const revalidate = 0

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth()
    
    const formData = await request.formData()
    const file = formData.get('image') as File | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }
    
    // Vérifier le type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPEG, PNG, WebP ou GIF.' },
        { status: 400 }
      )
    }
    
    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale : 5 MB.' },
        { status: 400 }
      )
    }
    
    // Convertir en buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${userId}/${timestamp}-${randomString}.${extension}`
    
    // Upload vers Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      // Fallback : stocker en base64 dans la base de données (temporaire)
      // Pour production, configurez Supabase Storage
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      return NextResponse.json({
        url: dataUrl,
        message: 'Image stockée temporairement. Configurez Supabase Storage pour un stockage permanent.'
      })
    }
    
    // Upload vers Supabase Storage (API REST)
    // Format : POST /storage/v1/object/{bucket}/{path}
    const uploadUrl = `${supabaseUrl}/storage/v1/object/wishlist-images/${fileName}`
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
        'Cache-Control': '3600',
      },
      body: buffer,
    })
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Supabase Storage upload error:', errorText)
      console.error('Upload URL:', uploadUrl)
      console.error('Response status:', uploadResponse.status)
      
      // Fallback : base64
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`
      
      return NextResponse.json({
        url: dataUrl,
        message: 'Image stockée temporairement. Erreur Supabase Storage. Vérifiez la configuration.'
      })
    }
    
    // Construire l'URL publique
    // Format : {supabaseUrl}/storage/v1/object/public/{bucket}/{path}
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/wishlist-images/${fileName}`
    
    return NextResponse.json({
      url: publicUrl,
      fileName,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'upload' },
      { status: 500 }
    )
  }
}

