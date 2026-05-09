import { NextResponse } from 'next/server'

// GoCardless Bank Account Data (formerly Nordigen) integration
// POST /api/bank/connect  { institution_id: "REVOLUT_REVOGB21" }
export async function POST(request: Request) {
  const { institution_id } = await request.json()

  const secretId = process.env.GOCARDLESS_SECRET_ID
  const secretKey = process.env.GOCARDLESS_SECRET_KEY

  if (!secretId || !secretKey) {
    return NextResponse.json({ error: 'GoCardless credentials not configured' }, { status: 500 })
  }

  try {
    // Get access token
    const tokenRes = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret_id: secretId, secret_key: secretKey }),
    })
    const { access } = await tokenRes.json()

    // Create requisition
    const reqRes = await fetch('https://bankaccountdata.gocardless.com/api/v2/requisitions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
      body: JSON.stringify({
        institution_id,
        redirect: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/bank/callback`,
        reference: crypto.randomUUID(),
      }),
    })
    const requisition = await reqRes.json()

    return NextResponse.json({ link: requisition.link, requisition_id: requisition.id })
  } catch {
    return NextResponse.json({ error: 'Failed to create requisition' }, { status: 500 })
  }
}
