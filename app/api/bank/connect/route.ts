import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.TRUELAYER_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'TrueLayer not configured' }, { status: 500 })

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/bank/callback`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'accounts transactions balance',
    redirect_uri: redirectUri,
    providers: 'revolut revolut-eu eu-oauth-all',
  })

  return NextResponse.redirect(`https://auth.truelayer.com/?${params}`)
}
