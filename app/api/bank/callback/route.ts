import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const ref = searchParams.get('ref')

  if (!ref) return NextResponse.redirect(`${origin}/finance?bank=error`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/auth/login`)

  try {
    const secretId = process.env.GOCARDLESS_SECRET_ID!
    const secretKey = process.env.GOCARDLESS_SECRET_KEY!

    const tokenRes = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret_id: secretId, secret_key: secretKey }),
    })
    const { access } = await tokenRes.json()

    // Get requisition details
    const reqRes = await fetch(`https://bankaccountdata.gocardless.com/api/v2/requisitions/${ref}/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
    const requisition = await reqRes.json()

    if (requisition.accounts?.length) {
      await supabase.from('bank_connections').insert({
        user_id: user.id,
        institution_id: requisition.institution_id,
        account_id: requisition.accounts[0],
        requisition_id: ref,
      })
    }
  } catch {
    return NextResponse.redirect(`${origin}/finance?bank=error`)
  }

  return NextResponse.redirect(`${origin}/finance?bank=connected`)
}
