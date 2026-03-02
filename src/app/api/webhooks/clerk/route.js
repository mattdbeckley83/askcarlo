import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getResend } from '@/lib/resend'

export async function POST(req) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET to environment variables')
    }

    // Get the headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Missing svix headers', { status: 400 })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Verify the webhook
    const wh = new Webhook(WEBHOOK_SECRET)
    let evt

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        })
    } catch (err) {
        console.error('Webhook verification failed:', err)
        return new Response('Webhook verification failed', { status: 400 })
    }

    const eventType = evt.type

    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name } = evt.data
        const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)?.email_address

        const { error } = await supabaseAdmin
            .from('users')
            .insert({
                id,
                email: primaryEmail,
                first_name: first_name || null,
                last_name: last_name || null,
            })

        if (error) {
            console.error('Error creating user in Supabase:', error)
            return new Response('Error creating user', { status: 500 })
        }

        console.log(`User ${id} created in Supabase`)

        // Send welcome email
        try {
            const resend = getResend()
            const name = first_name || 'there'
            await resend.emails.send({
                from: 'Carlo <matt@askcarlo.ai>',
                to: [primaryEmail],
                subject: 'Welcome to Carlo',
                html: `
                    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111827;">
                        <p style="font-size:24px;font-weight:700;margin:0 0 24px;">Welcome to Carlo, ${name}!</p>
                        <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
                            Carlo is your AI-powered backpacking advisor — built to help you plan smarter trips, optimize your pack weight, and get personalized gear recommendations.
                        </p>
                        <p style="font-size:16px;line-height:1.6;margin:0 0 32px;">
                            Here's how to get started:
                        </p>
                        <ol style="font-size:16px;line-height:1.8;margin:0 0 32px;padding-left:20px;">
                            <li>Add your gear to the <strong>Gear Closet</strong></li>
                            <li>Create your first <strong>Trip</strong></li>
                            <li>Chat with <strong>Carlo</strong> for personalized advice</li>
                        </ol>
                        <a href="https://app.askcarlo.ai" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;font-weight:600;">
                            Open Carlo
                        </a>
                        <p style="font-size:13px;color:#6b7280;margin-top:40px;">
                            You're receiving this because you signed up at askcarlo.ai.
                        </p>
                    </div>
                `,
                text: `Welcome to Carlo, ${name}!\n\nCarlo is your AI-powered backpacking advisor — built to help you plan smarter trips, optimize your pack weight, and get personalized gear recommendations.\n\nGet started at https://app.askcarlo.ai`,
            })
            console.log(`Welcome email sent to ${primaryEmail}`)
        } catch (emailError) {
            console.error('Error sending welcome email:', emailError)
            // Don't fail the webhook — user was created successfully
        }
    }

    return new Response('Webhook processed', { status: 200 })
}
