import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="flex justify-end px-8 sm:px-12 py-2 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-2">
                <span className="hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors">Terms &amp; Conditions</span>
                <span>|</span>
                <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy Policy</Link>
            </div>
        </footer>
    )
}
