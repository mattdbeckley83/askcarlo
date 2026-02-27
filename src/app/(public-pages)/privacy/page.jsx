export const metadata = {
    title: 'Privacy Policy | Carlo',
    description: 'Carlo privacy policy — how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10 sm:px-12 sm:py-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Carlo Privacy Policy</h1>
                    <p className="text-sm text-gray-500 mb-10">Last Updated: February 27, 2026</p>

                    <p className="text-gray-600 mb-10">
                        At Carlo, we respect your privacy and are committed to protecting your personal data. This
                        privacy policy explains how we collect, use, and protect your information when you use our
                        website (askcarlo.ai) and our AI-powered outdoor gear advisory services (the &ldquo;Services&rdquo;).
                    </p>

                    <Section title="1. Information We Collect">
                        <p className="text-gray-600 mb-3">
                            We collect the following types of personal information when you use our Services:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>Email Address:</strong> Provided during account creation, used for account management and communication.</li>
                            <li><strong>Name:</strong> Collected during sign-up for personalization.</li>
                            <li><strong>Outdoor Gear Inventory:</strong> Information about your hiking and outdoor equipment that you choose to add to your profile.</li>
                            <li><strong>Trip Information:</strong> Details about your outdoor trips and activities that you choose to track.</li>
                            <li><strong>Food &amp; Nutrition Data:</strong> Information about meal planning and nutrition for outdoor activities.</li>
                            <li><strong>User Preferences:</strong> Settings and preferences for personalized recommendations.</li>
                            <li><strong>IP Address:</strong> Automatically collected to enhance security and personalize services.</li>
                            <li><strong>Analytical Data:</strong> Usage patterns, features accessed, and interaction data to improve user experience.</li>
                        </ul>
                    </Section>

                    <Section title="2. How We Collect Data">
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>User Input:</strong> When you provide information during sign-up or while using features of our Services.</li>
                            <li><strong>Automatic Data Collection:</strong> Through your use of our Services via cookies and server logs.</li>
                            <li><strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to enhance functionality and understand usage.</li>
                        </ul>
                    </Section>

                    <Section title="3. Use of Your Data">
                        <p className="text-gray-600 mb-3">We use the information we collect for the following purposes:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>Account Creation and Management:</strong> To set up and maintain your account.</li>
                            <li><strong>Service Delivery:</strong> To provide personalized outdoor gear advice based on your inventory and trips.</li>
                            <li><strong>Service Improvement:</strong> To enhance our Services and develop new features.</li>
                            <li><strong>Billing and Payment Processing:</strong> To process payments securely via Stripe.</li>
                            <li><strong>Analytics:</strong> To analyze usage patterns and improve user experience.</li>
                            <li><strong>Communication:</strong> To send updates, notifications, and information related to your account.</li>
                        </ul>
                    </Section>

                    <Section title="4. Legal Basis for Processing Personal Data">
                        <p className="text-gray-600 mb-3">We process your personal data based on the following legal grounds:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>Consent:</strong> When you provide your information and agree to our terms.</li>
                            <li><strong>Contractual Necessity:</strong> To fulfill our obligations in providing Services to you.</li>
                            <li><strong>Legitimate Interests:</strong> For improving our Services and ensuring security.</li>
                        </ul>
                    </Section>

                    <Section title="5. Cookies &amp; Tracking Technologies">
                        <p className="text-gray-600 mb-3">We use cookies on our website to enhance your experience and analyze usage. These include:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-4">
                            <li><strong>Session Cookies:</strong> To keep you logged in during your session.</li>
                            <li><strong>Preference Cookies:</strong> To remember your choices and settings.</li>
                            <li><strong>Analytics Cookies:</strong> To gather usage data and improve our Services.</li>
                        </ul>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Managing Your Preferences</p>
                        <p className="text-gray-600">
                            You can manage or disable cookies through your browser settings. However, disabling cookies
                            may affect the functionality of our website.
                        </p>
                    </Section>

                    <Section title="6. Third-Party Sharing">
                        <p className="text-gray-600 mb-3">We share user data with the following third parties:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-4">
                            <li><strong>Clerk:</strong> For authentication and user management.</li>
                            <li><strong>Supabase:</strong> For data storage and security.</li>
                            <li><strong>Stripe:</strong> For payment processing.</li>
                            <li><strong>Anthropic:</strong> For providing AI-based outdoor advisory services.</li>
                            <li><strong>Perplexity AI:</strong> For web scraping and product data extraction.</li>
                        </ul>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Data Shared:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-4">
                            <li><strong>Clerk:</strong> Manages authentication and user accounts.</li>
                            <li><strong>Supabase:</strong> Stores your gear, trip, and account data securely.</li>
                            <li><strong>Stripe:</strong> Processes payment information securely.</li>
                            <li><strong>Anthropic:</strong> Provides AI services. Your gear and trip data is sent to Anthropic&rsquo;s Claude API to generate personalized recommendations. This data is processed according to Anthropic&rsquo;s privacy policy and is not used to train their models.</li>
                            <li><strong>Perplexity AI:</strong> Processes product URLs you provide for the smart-fill feature to extract product information from websites.</li>
                        </ul>
                        <p className="text-gray-600">We do not sell user data to third parties.</p>
                    </Section>

                    <Section title="7. Data Storage &amp; Security">
                        <p className="text-gray-600 mb-3">
                            Your data is stored securely using Supabase. We employ encryption, secure servers, and
                            strict access controls to protect your data from unauthorized access or disclosure.
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Security Measures Include:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>Encryption:</strong> Data is encrypted in transit (SSL/TLS) and at rest.</li>
                            <li><strong>Access Controls:</strong> Restricted access to personal data to authorized personnel only.</li>
                            <li><strong>Regular Audits:</strong> We conduct regular security assessments to maintain high security standards.</li>
                        </ul>
                    </Section>

                    <Section title="8. User Rights">
                        <p className="text-gray-600 mb-3">
                            Under the General Data Protection Regulation (GDPR), you have the following rights
                            concerning your personal data:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-4">
                            <li><strong>Right to Access:</strong> You can request a copy of the data we hold about you.</li>
                            <li><strong>Right to Rectification:</strong> You can request correction of inaccuracies in your data.</li>
                            <li><strong>Right to Erasure:</strong> You can request the deletion of your data.</li>
                            <li><strong>Right to Restrict Processing:</strong> You can request that we limit the processing of your data.</li>
                            <li><strong>Right to Data Portability:</strong> You can request to receive your data in a structured, commonly used format.</li>
                            <li><strong>Right to Object:</strong> You can object to the processing of your data for certain purposes.</li>
                            <li><strong>Right to Withdraw Consent:</strong> You can withdraw your consent at any time.</li>
                        </ul>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Exercising Your Rights</p>
                        <p className="text-gray-600">
                            To exercise any of these rights, please contact us at{' '}
                            <a href="mailto:matt@askcarlo.ai" className="text-[#fe7f2d] hover:underline">
                                matt@askcarlo.ai
                            </a>
                            . We will respond to your request within the timeframes established by applicable law.
                        </p>
                    </Section>

                    <Section title="9. International Data Transfers">
                        <p className="text-gray-600 mb-3">
                            Your data may be transferred and stored in countries outside of your own, including the
                            United States, for data processing and storage purposes via Supabase, Clerk, Anthropic,
                            and Perplexity AI.
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Safeguards in Place</p>
                        <p className="text-gray-600">
                            We rely on our service providers&rsquo; compliance with data protection laws and implement
                            appropriate safeguards, such as Standard Contractual Clauses, to ensure your data is
                            protected during international transfers.
                        </p>
                    </Section>

                    <Section title="10. Compliance with Regulations">
                        <p className="text-gray-600">
                            We comply with the General Data Protection Regulation (GDPR) and other applicable data
                            protection laws.
                        </p>
                    </Section>

                    <Section title="11. Children's Privacy">
                        <p className="text-gray-600">
                            Our Services are not intended for children under 18 years of age. We do not knowingly
                            collect personal information from minors. If we become aware that we have inadvertently
                            collected personal data from a minor, we will take steps to delete such information
                            promptly.
                        </p>
                    </Section>

                    <Section title="12. Payments">
                        <p className="text-gray-600 mb-2">
                            All payments for our Services are processed securely via Stripe. We do not handle or
                            store payment information directly.
                        </p>
                        <p className="text-gray-600">
                            Stripe Privacy Policy:{' '}
                            <a
                                href="https://stripe.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#fe7f2d] hover:underline"
                            >
                                https://stripe.com/privacy
                            </a>
                        </p>
                    </Section>

                    <Section title="13. Third-Party Services">
                        <p className="text-gray-600 mb-3">We use third-party services, including:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-3">
                            <li><strong>Clerk:</strong> For authentication and user management.</li>
                            <li><strong>Supabase:</strong> For data storage and security.</li>
                            <li><strong>Stripe:</strong> For payment processing.</li>
                            <li><strong>Anthropic (Claude API):</strong> To provide AI-based outdoor gear recommendations.</li>
                            <li><strong>Perplexity AI:</strong> To extract product information from URLs for the smart-fill feature.</li>
                            <li><strong>Vercel:</strong> For website hosting and infrastructure.</li>
                        </ul>
                        <p className="text-gray-600">
                            These services handle your data securely and in accordance with their own privacy policies.
                        </p>
                    </Section>

                    <Section title="14. Data Retention">
                        <p className="text-gray-600 mb-3">
                            We retain your personal data for as long as necessary to fulfill the purposes outlined in
                            this privacy policy unless a longer retention period is required or permitted by law.
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Criteria for Retention Periods:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-4">
                            <li><strong>Active Accounts:</strong> We retain data for the duration your account is active.</li>
                            <li><strong>Legal Obligations:</strong> We may retain data to comply with legal obligations.</li>
                            <li><strong>At User&rsquo;s Request:</strong> Data will be deleted upon request, subject to legal and contractual restrictions.</li>
                        </ul>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Data Deletion</p>
                        <p className="text-gray-600">
                            To request deletion of your data, please contact us at{' '}
                            <a href="mailto:matt@askcarlo.ai" className="text-[#fe7f2d] hover:underline">
                                matt@askcarlo.ai
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="15. Policy Updates">
                        <p className="text-gray-600 mb-3">
                            We may update this privacy policy from time to time to reflect changes in our practices or
                            for other operational, legal, or regulatory reasons.
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Notification of Changes:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>Significant Changes:</strong> We will notify you via email and/or a prominent notice on our Services.</li>
                            <li><strong>Effective Date:</strong> The &ldquo;Last Updated&rdquo; date at the top of this policy will indicate when it was last revised.</li>
                        </ul>
                    </Section>

                    <Section title="16. Contact Us">
                        <p className="text-gray-600 mb-1">
                            For any privacy-related inquiries or to exercise your rights, please contact us:
                        </p>
                        <p className="text-gray-600">
                            Email:{' '}
                            <a href="mailto:matt@askcarlo.ai" className="text-[#fe7f2d] hover:underline">
                                matt@askcarlo.ai
                            </a>
                        </p>
                    </Section>

                    <Section title="17. Use of Artificial Intelligence Technologies">
                        <p className="text-gray-600 mb-3">We utilize AI technologies to enhance our Services:</p>
                        <p className="text-gray-600 mb-3">
                            <strong>Anthropic Claude API:</strong> Used for generating personalized outdoor gear
                            recommendations and advice. When you ask Carlo a question, we send your query along with
                            relevant context from your gear inventory, trips, and preferences to Anthropic&rsquo;s Claude
                            API. The AI generates responses based on this information to provide you with tailored
                            advice. According to Anthropic&rsquo;s privacy policy, your data sent through the API is not
                            used to train their models.
                        </p>
                        <p className="text-gray-600">
                            <strong>Perplexity AI:</strong> Used for extracting product information from websites when
                            you use the smart-fill feature. When you provide a product URL, we use Perplexity&rsquo;s
                            service to fetch and parse the webpage content, then send relevant product details to
                            Anthropic&rsquo;s Claude API for structured extraction. According to Perplexity&rsquo;s privacy
                            policy, your data is processed to provide the service and is not used to train their models.
                        </p>
                    </Section>

                    <Section title="18. Analytical Data Collection">
                        <p className="text-gray-600 mb-3">
                            We collect analytical data about user activity on our Services to improve user experience.
                            This includes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-4">
                            <li><strong>Usage Behavior:</strong> Pages visited, time spent, features used.</li>
                            <li><strong>Interaction Data:</strong> Clicks, navigation paths, form submissions.</li>
                            <li><strong>Device Information:</strong> Browser type, operating system, screen size.</li>
                        </ul>
                        <p className="text-gray-600 mb-2">We use this data to:</p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li><strong>Enhance Functionality:</strong> Improve navigation, features, and performance.</li>
                            <li><strong>Personalize Content:</strong> Provide tailored recommendations.</li>
                            <li><strong>Track Conversions:</strong> Monitor user interactions and key events.</li>
                        </ul>
                    </Section>

                    <Section title="19. Managing Your Preferences">
                        <p className="text-gray-600">
                            You may manage your communication preferences (e.g., for marketing emails) by following
                            the unsubscribe instructions provided in emails or by contacting us at{' '}
                            <a href="mailto:matt@askcarlo.ai" className="text-[#fe7f2d] hover:underline">
                                matt@askcarlo.ai
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="20. Links to Other Websites">
                        <p className="text-gray-600">
                            Our Services may contain links to other websites. We are not responsible for the privacy
                            practices of these sites. We encourage you to read their privacy policies.
                        </p>
                    </Section>

                    <Section title="21. Security" last>
                        <p className="text-gray-600">
                            We are committed to ensuring the security of your information. While we strive to use
                            commercially acceptable means to protect your personal data, we cannot guarantee its
                            absolute security.
                        </p>
                    </Section>
                </div>
            </div>
        </div>
    )
}

function Section({ title, children, last = false }) {
    return (
        <section className={last ? '' : 'mb-8 pb-8 border-b border-gray-100'}>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
            {children}
        </section>
    )
}
