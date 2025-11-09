import { NextRequest, NextResponse } from 'next/server'
import { unsubscribePush } from '@/lib/push'

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json()
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint requis' },
        { status: 400 }
      )
    }
    
    await unsubscribePush(endpoint)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

