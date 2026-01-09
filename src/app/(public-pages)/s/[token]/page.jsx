import { getTripShare } from '@/server/actions/trips/getTripShare'
import SharedTripDetail from './_components/SharedTripDetail'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import { PiWarning, PiLinkBreak, PiTrash } from 'react-icons/pi'
import CarloWordmark from '@/components/ui/CarloWordmark'

// Disable caching to ensure fresh trip data
export const dynamic = 'force-dynamic'

// Generate Open Graph metadata dynamically
export async function generateMetadata({ params }) {
    const { token } = await params
    const result = await getTripShare(token)

    if (!result.success || !result.trip) {
        return {
            title: 'Shared Trip | Carlo',
            description: 'View a shared backpacking trip on Carlo',
        }
    }

    const trip = result.trip
    const activity = result.activity?.name || 'Backpacking'

    // Format dates for description
    let dateRange = ''
    if (trip.start_date || trip.end_date) {
        const startDate = trip.start_date
            ? new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : ''
        const endDate = trip.end_date
            ? new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : ''
        dateRange = startDate && endDate ? ` from ${startDate} to ${endDate}` : ''
    }

    // Calculate total weight for description
    let totalWeight = ''
    if (result.tripItems && result.tripItems.length > 0) {
        let totalOz = 0
        result.tripItems.forEach((tripItem) => {
            const item = tripItem.items
            if (!item || !item.weight) return
            const weightOz = item.weight_unit === 'oz' ? item.weight :
                item.weight_unit === 'lb' ? item.weight * 16 :
                    item.weight_unit === 'g' ? item.weight * 0.035274 :
                        item.weight_unit === 'kg' ? item.weight * 35.274 : item.weight
            totalOz += weightOz * tripItem.quantity
        })
        if (totalOz >= 16) {
            const lb = (totalOz / 16).toFixed(1)
            totalWeight = ` - ${lb} lbs total`
        } else {
            totalWeight = ` - ${totalOz.toFixed(1)} oz total`
        }
    }

    const description = `${activity} trip${dateRange}${totalWeight}`

    return {
        title: `${trip.name} - Shared on Carlo`,
        description,
        openGraph: {
            title: `${trip.name} - Shared on Carlo`,
            description,
            type: 'website',
            url: `https://app.askcarlo.ai/s/${token}`,
            siteName: 'Carlo',
        },
        twitter: {
            card: 'summary',
            title: `${trip.name} - Shared on Carlo`,
            description,
        },
    }
}

// Error component for different error states
function ShareError({ errorType, message }) {
    const icons = {
        invalid: <PiLinkBreak className="text-5xl text-gray-400 mb-4" />,
        inactive: <PiWarning className="text-5xl text-amber-500 mb-4" />,
        deleted: <PiTrash className="text-5xl text-gray-400 mb-4" />,
    }

    const titles = {
        invalid: 'Invalid Share Link',
        inactive: 'Share Link Inactive',
        deleted: 'Trip No Longer Available',
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center p-8">
                {icons[errorType] || icons.invalid}
                <h1 className="text-xl font-semibold mb-2">
                    {titles[errorType] || 'Error'}
                </h1>
                <p className="text-gray-500 mb-6">{message}</p>
                <Link
                    href="https://askcarlo.ai"
                    className="text-orange-500 hover:text-orange-600 font-medium"
                >
                    Learn about Carlo
                </Link>
            </Card>
        </div>
    )
}

export default async function SharedTripPage({ params }) {
    const { token } = await params
    const result = await getTripShare(token)

    // Handle error cases
    if (result.error) {
        return <ShareError errorType={result.errorType} message={result.error} />
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="https://askcarlo.ai">
                        <CarloWordmark width={120} height={24} className="text-gray-900 dark:text-white" />
                    </Link>
                    <Link
                        href="https://app.askcarlo.ai"
                        className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                        Sign up free
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <SharedTripDetail
                    trip={result.trip}
                    tripItems={result.tripItems}
                    categories={result.categories}
                    activity={result.activity}
                />
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
                <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
                    <p>
                        Plan your own backpacking trips with{' '}
                        <Link
                            href="https://askcarlo.ai"
                            className="text-orange-500 hover:text-orange-600 font-medium"
                        >
                            Carlo
                        </Link>
                    </p>
                </div>
            </footer>
        </div>
    )
}
