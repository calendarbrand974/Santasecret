import { NextRequest, NextResponse } from 'next/server'
import { extractMetadata } from '@/lib/metadata-extractor'
import { z } from 'zod'

const urlSchema = z.object({
  url: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = urlSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'URL invalide' },
        { status: 400 }
      )
    }
    
    const { url } = validation.data
    const metadata = await extractMetadata(url)
    
    if (!metadata) {
      return NextResponse.json(
        { error: 'Impossible d\'extraire les métadonnées' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ metadata })
  } catch (error: any) {
    console.error('Extract metadata error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

