import Card from '@/components/ui/Card'

export const metadata = {
    title: 'Contact Us | Carlo',
}

export default function ContactPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Contact Us</h1>
                <p className="text-gray-500 mt-1">
                    We&apos;d love to hear from you!
                </p>
            </div>

            <div className="max-w-2xl flex flex-col gap-6">
                <Card>
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            If you have any questions, feedback, or would like to report an issue,
                            please reach out to us at{' '}
                            <a
                                href="mailto:matt@askcarlo.ai"
                                className="text-[#fe7f2d] hover:underline font-medium transition-colors"
                            >
                                matt@askcarlo.ai
                            </a>
                            {' '}and we will get back to you as soon as we can.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
