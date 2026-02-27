import { PiEnvelope } from 'react-icons/pi'

export const metadata = {
    title: 'Contact Us | Carlo',
}

export default function ContactPage() {
    return (
        <div className="px-4 sm:px-6 md:px-8 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Contact Us
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-16">
                    We&apos;d love to hear from you!
                </p>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 md:p-16">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-[#fe7f2d] rounded-full flex items-center justify-center">
                            <PiEnvelope className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
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
            </div>
        </div>
    )
}
