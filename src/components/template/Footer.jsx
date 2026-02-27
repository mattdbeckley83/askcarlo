export default function Footer() {
    return (
        <footer className="flex justify-end px-8 sm:px-12 py-2 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-2">
                <a href="https://askcarlo.ai/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms &amp; Conditions</a>
                <span>|</span>
                <a href="https://askcarlo.ai/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy Policy</a>
            </div>
        </footer>
    )
}
