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

        // Send welcome email to new user + signup notification to Matt (in parallel)
        try {
            const resend = getResend()
            const name = first_name || 'there'
            const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Unknown'
            const signupTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })

            await Promise.all([
                resend.emails.send({
                    from: 'Matt <matt@askcarlo.ai>',
                    to: [primaryEmail],
                    subject: 'Welcome to Carlo',
                    html: `
                        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111827;">
                            <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Hi ${name},</p>
                            <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
                                My name is Matt and I'm one of the creators of Carlo, your new digital basecamp for backcountry adventures. We built this platform to help outdoor enthusiasts of any skill/experience level make more confident decisions around trip planning, gear, nutrition and everything in between. We hope these tools help you get into the wilderness more often and confidently plan out some epic adventures.
                            </p>
                            <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Here is how to get started:</p>
                            <ol style="font-size:16px;line-height:1.8;margin:0 0 32px;padding-left:20px;">
                                <li>Complete your user <strong>profile</strong> so Carlo knows your adventure preferences.</li>
                                <li>Add your gear to the <strong>Gear Closet</strong>.</li>
                                <li>Create your first <strong>Trip</strong>.</li>
                                <li>Start a conversation with <strong>Carlo</strong> for personalized advice.</li>
                            </ol>
                            <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
                                We'd love to hear from you and make sure Carlo is giving you great advice. Hit "Reply" and let me know if there is anything you need. I read and reply to every email.
                            </p>
                            <p style="font-size:16px;line-height:1.6;margin:0 0 4px;">Cheers,</p>
                            <p style="font-size:16px;line-height:1.6;margin:0 0 40px;">Matt</p>
                            <p style="font-size:13px;color:#6b7280;margin:0;">
                                You're receiving this because you signed up at askcarlo.ai.
                            </p>
                        </div>
                    `,
                    text: `Hi ${name},\n\nMy name is Matt and I'm one of the creators of Carlo, your new digital basecamp for backcountry adventures. We built this platform to help outdoor enthusiasts of any skill/experience level make more confident decisions around trip planning, gear, nutrition and everything in between. We hope these tools help you get into the wilderness more often and confidently plan out some epic adventures.\n\nHere is how to get started:\n\n1. Complete your user profile so Carlo knows your adventure preferences.\n2. Add your gear to the Gear Closet.\n3. Create your first Trip.\n4. Start a conversation with Carlo for personalized advice.\n\nWe'd love to hear from you and make sure Carlo is giving you great advice. Hit "Reply" and let me know if there is anything you need. I read and reply to every email.\n\nCheers,\nMatt`,
                }),
                resend.emails.send({
                    from: 'Carlo <notifications@askcarlo.ai>',
                    to: ['matt@askcarlo.ai'],
                    subject: `New signup: ${fullName}`,
                    html: `
                        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111827;">
                            <p style="font-size:18px;font-weight:600;margin:0 0 16px;">New Carlo signup</p>
                            <table style="font-size:14px;line-height:1.8;border-collapse:collapse;width:100%;">
                                <tr><td style="color:#6b7280;padding-right:16px;">Name</td><td>${fullName}</td></tr>
                                <tr><td style="color:#6b7280;padding-right:16px;">Email</td><td>${primaryEmail}</td></tr>
                                <tr><td style="color:#6b7280;padding-right:16px;">Time</td><td>${signupTime} ET</td></tr>
                                <tr><td style="color:#6b7280;padding-right:16px;">User ID</td><td style="font-family:monospace;font-size:12px;">${id}</td></tr>
                            </table>
                        </div>
                    `,
                    text: `New Carlo signup\n\nName: ${fullName}\nEmail: ${primaryEmail}\nTime: ${signupTime} ET\nUser ID: ${id}`,
                }),
            ])
            console.log(`Welcome email sent to ${primaryEmail}; signup notification sent to matt@askcarlo.ai`)
        } catch (emailError) {
            console.error('Error sending emails:', emailError)
            // Don't fail the webhook — user was created successfully
        }
    }

    return new Response('Webhook processed', { status: 200 })
}
