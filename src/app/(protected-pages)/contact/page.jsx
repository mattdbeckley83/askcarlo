import Card from '@/components/ui/Card'
import { PiEnvelope } from 'react-icons/pi'

export const metadata = {
    title: 'Contact Us | Carlo',
}

export default function ContactPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Contact Us</h1>
            </div>

            <div className="max-w-2xl">
                <Card>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <PiEnvelope className="text-orange-500" size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">Get in Touch</h2>
                            </div>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300">
                            If you have any questions, feedback, or would like to report an issue, please reach out at{' '}
                            <a
                                href="mailto:matt@askcarlo.ai"
                                className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
                            >
                                matt@askcarlo.ai
                            </a>{' '}
                            and we will get back to you ASAP.
                        </p>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                <span className="font-medium">Response Time:</span> We typically respond within 24-48 hours during business days.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
