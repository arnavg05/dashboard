import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function guessCategory(description: string): string {
  const d = description.toLowerCase()
  if (d.includes('rewe') || d.includes('edeka') || d.includes('lidl') || d.includes('aldi') || d.includes('penny') || d.includes('netto') || d.includes('tesco') || d.includes('sainsbury') || d.includes('supermarket')) return 'Food & Drink'
  if (d.includes('uber') || d.includes('bvg') || d.includes('db bahn') || d.includes('deutschebahn') || d.includes('transport') || d.includes('tfl') || d.includes('train') || d.includes('bus')) return 'Transport'
  if (d.includes('netflix') || d.includes('spotify') || d.includes('amazon prime') || d.includes('disney') || d.includes('youtube')) return 'Subscriptions'
  if (d.includes('rent') || d.includes('miete') || d.includes('mortgage') || d.includes('council')) return 'Housing'
  if (d.includes('amazon') || d.includes('ebay') || d.includes('zalando') || d.includes('asos')) return 'Shopping'
  if (d.includes('gym') || d.includes('pharmacy') || d.includes('apotheke') || d.includes('doctor') || d.includes('arzt')) return 'Health'
  if (d.includes('restaurant') || d.includes('cafe') || d.includes('mcdonald') || d.includes('döner') || d.includes('pizza')) return 'Eating Out'
  return 'Other'
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: connections } = await supabase.from('bank_connections')
    .select('*').eq('user_id', user.id).eq('active', true).eq('provider', 'truelayer')

  if (!connections?.length) return NextResponse.json({ synced: 0, error: 'No bank connected' })

  let totalSynced = 0

  for (const conn of connections) {
    // Use refresh token to get a fresh access token
    const tokenRes = await fetch('https://auth.truelayer.com/connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.TRUELAYER_CLIENT_ID!,
        client_secret: process.env.TRUELAYER_CLIENT_SECRET!,
        refresh_token: conn.requisition_id,
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) continue

    // Store the new tokens
    await supabase.from('bank_connections').update({
      institution_id: tokens.access_token,
      requisition_id: tokens.refresh_token ?? conn.requisition_id,
    }).eq('id', conn.id)

    // Fetch last 90 days of transactions
    const from = new Date()
    from.setDate(from.getDate() - 90)
    const fromStr = from.toISOString().split('T')[0]
    const toStr = new Date().toISOString().split('T')[0]

    const txnRes = await fetch(
      `https://api.truelayer.com/data/v1/accounts/${conn.account_id}/transactions?from=${fromStr}&to=${toStr}`,
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    )
    const txnData = await txnRes.json()
    const transactions: any[] = txnData.results ?? []

    for (const t of transactions) {
      const amount = Math.abs(t.amount)
      const type: 'income' | 'expense' = t.amount > 0 ? 'income' : 'expense'
      const description = t.description ?? t.merchant_name ?? ''

      await supabase.from('transactions').upsert({
        user_id: user.id,
        txn_date: t.timestamp.split('T')[0],
        type,
        amount,
        category: type === 'income' ? 'Income' : guessCategory(description),
        description,
        source: 'revolut',
        external_id: t.transaction_id,
      }, { onConflict: 'user_id,external_id', ignoreDuplicates: true })

      totalSynced++
    }

    await supabase.from('bank_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', conn.id)
  }

  return NextResponse.json({ synced: totalSynced })
}
