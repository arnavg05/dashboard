import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) return NextResponse.redirect(`${origin}/finance?bank=error`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/auth/login`)

  try {
    const redirectUri = `${origin}/api/bank/callback`

    const tokenRes = await fetch('https://auth.truelayer.com/connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.TRUELAYER_CLIENT_ID!,
        client_secret: process.env.TRUELAYER_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        code,
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) return NextResponse.redirect(`${origin}/finance?bank=error`)

    const accountsRes = await fetch('https://api.truelayer.com/data/v1/accounts', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const accountsData = await accountsRes.json()
    const accounts: { account_id: string }[] = accountsData.results ?? []
    if (!accounts.length) return NextResponse.redirect(`${origin}/finance?bank=error`)

    // Remove any old connection then insert fresh
    await supabase.from('bank_connections').delete().eq('user_id', user.id).eq('provider', 'truelayer')
    await supabase.from('bank_connections').insert({
      user_id: user.id,
      provider: 'truelayer',
      institution_id: tokens.access_token,   // repurposed: stores access token
      requisition_id: tokens.refresh_token,  // repurposed: stores refresh token
      account_id: accounts[0].account_id,
    })
  } catch {
    return NextResponse.redirect(`${origin}/finance?bank=error`)
  }

  return NextResponse.redirect(`${origin}/finance?bank=connected`)
}
