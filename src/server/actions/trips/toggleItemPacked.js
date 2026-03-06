'use server'

import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function toggleItemPacked(tripItemId, tripId) {
    const { userId } = await auth()

    if (!userId) return { error: 'Unauthorized' }
    if (!tripItemId) return { error: 'Trip Item ID is required' }

    const { data: tripItem, error: fetchError } = await supabaseAdmin
        .from('trip_items')
        .select('id, packed, trips(user_id)')
        .eq('id', tripItemId)
        .single()

    if (fetchError || !tripItem) return { error: 'Trip item not found' }
    if (tripItem.trips?.user_id !== userId) return { error: 'Unauthorized' }

    const { error: updateError } = await supabaseAdmin
        .from('trip_items')
        .update({ packed: !tripItem.packed })
        .eq('id', tripItemId)

    if (updateError) return { error: 'Failed to update packed status' }

    revalidatePath(`/trips/${tripId}`)
    return { success: true, packed: !tripItem.packed }
}
