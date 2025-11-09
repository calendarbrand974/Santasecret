import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imageUrl = searchParams.get('url')
  
  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }
  
  try {
    // Décoder l'URL correctement
    const decodedUrl = decodeURIComponent(imageUrl)
    
    // Déterminer le referer selon le domaine
    let referer = 'https://www.google.com/'
    try {
      const urlObj = new URL(decodedUrl)
      const hostname = urlObj.hostname.toLowerCase()
      if (hostname.includes('amazon.') || hostname.includes('amzn.')) {
        referer = 'https://www.amazon.com/'
      } else if (hostname.includes('ullapopken.')) {
        referer = 'https://www.ullapopken.de/'
      } else {
        referer = `https://${hostname}/`
      }
    } catch {}
    
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': referer,
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    })
    
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }
    
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Error fetching image', { status: 500 })
  }
}

