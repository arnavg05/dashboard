import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { EXPENSE_CATEGORIES } from '@/lib/constants'

function guessCategory(description: string): string {
  const d = description.toLowerCase()
  if (d.includes('tesco') || d.includes('sainsbury') || d.includes('lidl') || d.includes('aldi') || d.includes('asda') || d.includes('waitrose')) return 'Food & Drink'
  if (d.includes('uber') || d.includes('transport') || d.includes('tfl') || d.includes('train') || d.includes('bus')) return 'Transport'
  if (d.includes('netflix') || d.includes('spotify') || d.includes('amazon prime') || d.includes('disney')) return 'Subscriptions'
  if (d.includes('rent') || d.includes('mortgage') || d.includes('council tax')) return 'Housing'
  if (d.includes('amazon') || d.includes('ebay') || d.includes('asos')) return 'Shopping'
  if (d.includes('gym') || d.includes('pharmacy') || d.includes('nhs')) return 'Health'
  return 'Other'
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: connections } = await supabase.from('bank_connections')
    .select('*').eq('user_id', user.id).eq('active', true)

  if (!connections?.length) return NextResponse.json({ synced: 0 })

  const secretId = process.env.GOCARDLESS_SECRET_ID!
  const secretKey = process.env.GOCARDLESS_SECRET_KEY!

  const tokenRes = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret_id: secretId, secret_key: secretKey }),
  })
  const { access } = await tokenRes.json()

  let totalSynced = 0

  for (const conn of connections) {
    const txnRes = await fetch(
      `https://bankaccountdata.gocardless.com/api/v2/accounts/${conn.account_id}/transactions/`,
      { headers: { Authorization: `Bearer ${access}` } }
    )
    const { transactions } = await txnRes.json()
    const booked: any[] = transactions?.booked ?? []

    for (const t of booked) {
      const amount = Math.abs(parseFloat(t.transactionAmount?.amount ?? '0'))
      const type: 'income' | 'expense' = parseFloat(t.transactionAmount?.amount ?? '0') > 0 ? 'income' : 'expense'
      const description = t.remittanceInformationUnstructured ?? t.creditorName ?? ''
      const date = t.bookingDate ?? t.valueDate

      await supabase.from('transactions').upsert({
        user_id: user.id,
        txn_date: date,
        type,
        amount,
        category: type === 'income' ? 'Income' : guessCategory(description),
        description,
        source: 'revolut',
        external_id: t.transactionId ?? `${conn.account_id}-${date}-${amount}`,
      }, { onConflict: 'user_id,external_id', ignoreDuplicates: true })

      totalSynced++
    }

    await supabase.from('bank_connections').update({ last_synced_at: new Date().toISOString() }).eq('id', conn.id)
  }

  return NextResponse.json({ synced: totalSynced })
}
