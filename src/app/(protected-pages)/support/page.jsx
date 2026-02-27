import Card from '@/components/ui/Card'

export const metadata = {
    title: 'Support | Carlo',
}

const faqs = [
    {
        question: 'How does the token system work?',
        answer:
            "Tokens are Carlo's currency for AI-powered features. Every time you chat with Carlo or use Smart Fill, a small number of tokens are deducted from your balance based on how much AI processing your request required. One token is worth $0.01, so a balance of 100 tokens equals $1.00 of AI usage.",
    },
    {
        question: 'How is token cost calculated for a message?',
        answer:
            'Each message has two components: input (everything Carlo reads to formulate a response) and output (Carlo\'s actual reply). Input includes the full conversation history up to that point, your gear list data, and your new message. Output is the length of Carlo\'s response. We calculate the raw cost of both, apply a markup to cover infrastructure and keep Carlo running, and round up to the nearest whole token — with a minimum of 1 token per message.',
    },
    {
        question: 'Why do messages get more expensive as a conversation goes on?',
        answer:
            'Carlo re-reads the entire conversation history every time you send a message. A first message in a fresh conversation is cheap because there\'s no history. By your 15th back-and-forth, Carlo is processing everything said before plus your new question. Starting a new conversation resets this — so if you\'re shifting to a completely new topic, a fresh chat is more economical.',
    },
    {
        question: "What's a typical token cost per message?",
        answer:
            'Most messages cost 1–5 tokens. A short question early in a conversation will usually cost 1 token. A detailed analytical request later in a long session — like asking Carlo to compare your entire shelter system against ultralight benchmarks and suggest specific alternatives — could cost 15–25 tokens. You\'ll rarely hit the high end unless you\'re doing deep, extended analysis.',
    },
    {
        question: 'Does my gear list affect token cost?',
        answer:
            'Yes. When Carlo needs context about your gear to answer a question, your gear list is included in the input. A larger gear list means slightly higher input costs. In practice this adds a small, consistent overhead to each message rather than dramatically changing the cost — but it\'s worth knowing that a 150-item kit costs a bit more per message than a 30-item kit.',
    },
    {
        question: "What's the best way to get the most out of my tokens?",
        answer: null,
        tips: [
            {
                title: 'Start new conversations for new topics.',
                detail:
                    'Conversation history is the biggest driver of cost. A fresh chat is always cheaper for an unrelated question.',
            },
            {
                title: 'Be specific.',
                detail:
                    '"What\'s a lighter alternative to my Big Agnes tent under $400?" gets a better answer than "What should I upgrade?" — and doesn\'t require Carlo to ask clarifying questions, saving a round trip.',
            },
            {
                title: 'Batch related questions.',
                detail:
                    'If you have five questions about your sleep system, ask them together in one message rather than one at a time. Carlo can address all of them in a single response.',
            },
            {
                title: "Don't ask Carlo to recap.",
                detail:
                    'Asking Carlo to summarize what was just discussed is expensive — it re-processes the full history to produce something you already have on screen.',
            },
        ],
    },
    {
        question: 'Do tokens expire?',
        answer:
            'No. Tokens you purchase remain in your account indefinitely. There are no monthly limits, no rollover concerns, and no expiration dates.',
    },
    {
        question: "How do I know when I'm running low?",
        answer:
            'Your token balance is always visible in the top navigation bar. The balance updates in real time after each message. When you\'re running low, clicking the balance shows options to purchase additional tokens directly — no need to navigate away from what you\'re doing.',
    },
    {
        question: 'Why do you charge for AI usage instead of a flat monthly subscription?',
        answer:
            "Token-based billing means you only pay for what you actually use. Casual users who plan one or two trips a year aren't subsidizing power users who chat with Carlo daily. It also means you can buy exactly as much as you need — a small top-up before a big trip planning session, or a larger pack if you use Carlo heavily.",
    },
]

export default function SupportPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Support and FAQs</h1>
                <p className="text-gray-500 mt-1">
                    Answers to common questions about Carlo and how billing works
                </p>
            </div>

            <div className="max-w-2xl flex flex-col gap-6">
                <Card>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {faqs.map((faq, index) => (
                            <div key={faq.question} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                <div className="flex-shrink-0 w-6 text-sm font-semibold text-gray-400 dark:text-gray-500 pt-0.5">
                                    {index + 1}.
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                        {faq.question}
                                    </h2>
                                    {faq.answer && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    )}
                                    {faq.tips && (
                                        <ul className="flex flex-col gap-2 mt-1">
                                            {faq.tips.map((tip) => (
                                                <li key={tip.title} className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="text-[#fe7f2d] font-bold flex-shrink-0">·</span>
                                                    <span>
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                                            {tip.title}
                                                        </span>{' '}
                                                        {tip.detail}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Still have questions?
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Reach out at{' '}
                            <a
                                href="mailto:matt@askcarlo.ai"
                                className="text-[#fe7f2d] hover:underline font-medium"
                            >
                                matt@askcarlo.ai
                            </a>{' '}
                            and I'll get back to you as soon as possible. Thanks!
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
