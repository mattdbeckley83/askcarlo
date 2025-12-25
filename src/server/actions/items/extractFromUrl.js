'use server'

import Anthropic from '@anthropic-ai/sdk'

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const isDev = process.env.NODE_ENV !== 'production'

function sfLog(...args) {
    if (isDev) console.log(...args)
}

function sfGroup(label) {
    if (isDev) console.group(label)
}

function sfGroupEnd() {
    if (isDev) console.groupEnd()
}

// Validate URL format
function isValidUrl(string) {
    try {
        const url = new URL(string)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

// Stage 1: Fetch product details from Perplexity
async function fetchFromPerplexity(url) {
    const perplexityPrompt = `Extract product details from this URL: ${url}

Return the following information:
- Product name (full name including model/variant)
- Brand name
- Weight (numeric value)
- Weight unit (oz, lb, g, or kg)
- Description (brief product description, key features)
- Product category (e.g., Shelter, Sleep, Cooking, Clothing, Footwear, Backpack, Electronics, etc.)

If any information is not available, indicate that clearly.`

    sfGroup('--- PERPLEXITY STAGE ---')
    sfLog('Perplexity prompt:', perplexityPrompt)

    const startTime = Date.now()

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
                {
                    role: 'system',
                    content: 'You are a product research assistant. Extract detailed product information from URLs. Focus on outdoor gear, camping equipment, and backpacking products. Be thorough and accurate.',
                },
                {
                    role: 'user',
                    content: perplexityPrompt,
                },
            ],
            max_tokens: 1024,
            temperature: 0.1,
        }),
    })

    const latency = Date.now() - startTime

    if (!response.ok) {
        const errorText = await response.text()
        console.error('--- SMART-FILL ERROR ---')
        console.error('Stage: Perplexity API')
        console.error('Error:', errorText)
        sfGroupEnd()
        throw new Error('Failed to fetch product details from Perplexity')
    }

    const data = await response.json()
    const perplexityResponse = data.choices[0]?.message?.content || ''

    sfLog('Perplexity latency (ms):', latency)
    sfLog('Perplexity raw response:', perplexityResponse)
    sfGroupEnd()

    return perplexityResponse
}

// Stage 2: Extract structured JSON using Claude
async function extractWithClaude(perplexityResponse, originalUrl) {
    const anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
    })

    const claudePrompt = `You are a data extraction assistant. Parse the following product information and return a structured JSON response.

Product information from web search:
${perplexityResponse}

Original URL: ${originalUrl}

Determine the item_type based on the product:
- "gear" = equipment, clothing, tools, accessories, containers, packs, shelters, sleeping bags, pads, electronics, cookware, water bottles, filters
- "food" = consumable food items, meals, snacks, bars, drinks, supplements, freeze-dried meals, trail mix, energy gels
- "fuel" = stove fuel, gas canisters, alcohol fuel, white gas, propane, fuel bottles

If item_type is "food", also extract calorie information if available (total calories for the package/serving).

Return ONLY a valid JSON object with these exact fields:
{
    "name": "string - product name, or empty string if not found",
    "brand": "string - brand name, or empty string if not found",
    "category": "string - suggested category (Shelter, Sleep, Cooking, Water, Clothing, Footwear, Backpack, Electronics, Food Storage, Misc, Breakfast, Lunch, Dinner, Snacks), or empty string if uncertain",
    "weight": "number or null - weight value as a number, or null if not found",
    "weight_unit": "string - oz, lb, g, or kg, or empty string if not found",
    "description": "string - brief description, or empty string if not found",
    "product_url": "string - the original URL",
    "confidence": "number between 0 and 1 - how confident you are in the extracted data overall",
    "item_type": "string - gear, food, or fuel",
    "calories": "number or null - total calories (only for food items), or null if not food or not found"
}

Confidence guidelines:
- 0.9-1.0: All key fields found and verified (name, brand, weight)
- 0.7-0.89: Most fields found, some uncertainty
- 0.5-0.69: Some fields found but missing key data
- Below 0.5: Very limited or unreliable data

Return ONLY the JSON object, no other text or markdown formatting.`

    sfGroup('--- CLAUDE EXTRACTION STAGE ---')
    sfLog('Claude prompt:', claudePrompt)
    sfLog('Content sent to Claude (from Perplexity):', perplexityResponse)

    const startTime = Date.now()

    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: claudePrompt,
            },
        ],
    })

    const latency = Date.now() - startTime
    const content = message.content[0]?.text || '{}'

    sfGroup('--- CLAUDE RESPONSE ---')
    sfLog('Claude latency (ms):', latency)
    sfLog('Raw Claude response:', content)
    sfLog('Usage:', message.usage)
    sfGroupEnd()

    // Parse the JSON response
    try {
        // Clean up any potential markdown formatting
        let jsonStr = content.trim()
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.slice(7)
        }
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.slice(3)
        }
        if (jsonStr.endsWith('```')) {
            jsonStr = jsonStr.slice(0, -3)
        }
        jsonStr = jsonStr.trim()

        const parsed = JSON.parse(jsonStr)

        sfLog('Parsed extraction:', parsed)
        sfLog('Confidence score:', parsed.confidence)
        sfLog('Detected item_type:', parsed.item_type)
        sfLog('Calories (if food):', parsed.calories)
        sfGroupEnd()

        // Ensure all required fields exist
        return {
            name: parsed.name || '',
            brand: parsed.brand || '',
            category: parsed.category || '',
            weight: parsed.weight ?? null,
            weight_unit: parsed.weight_unit || '',
            description: parsed.description || '',
            product_url: originalUrl,
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
            item_type: parsed.item_type || 'gear',
            calories: parsed.calories ?? null,
        }
    } catch (parseError) {
        console.error('--- SMART-FILL ERROR ---')
        console.error('Stage: Claude JSON parsing')
        console.error('Error:', parseError)
        console.error('Raw content:', content)
        sfGroupEnd()
        throw new Error('Failed to parse extracted product data')
    }
}

export async function extractFromUrl(url) {
    const startTime = Date.now()
    sfGroup('--- SMART-FILL DEBUG START ---')
    sfLog('Timestamp:', new Date().toISOString())
    sfLog('URL to extract:', url)

    // Validate inputs
    if (!url || typeof url !== 'string') {
        sfLog('Error: URL is required')
        sfGroupEnd()
        return { error: 'URL is required' }
    }

    const trimmedUrl = url.trim()
    if (!isValidUrl(trimmedUrl)) {
        sfLog('Error: Invalid URL format')
        sfGroupEnd()
        return { error: 'Invalid URL format. Please enter a valid http or https URL.' }
    }

    // Check API keys
    if (!PERPLEXITY_API_KEY) {
        console.error('PERPLEXITY_API_KEY not configured')
        sfGroupEnd()
        return { error: 'Product lookup service is not configured' }
    }

    if (!ANTHROPIC_API_KEY) {
        console.error('ANTHROPIC_API_KEY not configured')
        sfGroupEnd()
        return { error: 'Product lookup service is not configured' }
    }

    try {
        // Stage 1: Fetch from Perplexity
        const perplexityResponse = await fetchFromPerplexity(trimmedUrl)

        if (!perplexityResponse) {
            sfLog('Error: No product information found')
            sfGroupEnd()
            return { error: 'No product information found for this URL' }
        }

        // Stage 2: Extract structured data with Claude
        const extractedData = await extractWithClaude(perplexityResponse, trimmedUrl)

        sfGroup('--- FINAL ITEM FIELDS ---')
        sfLog('name:', extractedData.name)
        sfLog('brand:', extractedData.brand)
        sfLog('category:', extractedData.category)
        sfLog('weight:', extractedData.weight)
        sfLog('weight_unit:', extractedData.weight_unit)
        sfLog('description:', extractedData.description)
        sfLog('product_url:', extractedData.product_url)
        sfLog('confidence:', extractedData.confidence)
        sfLog('item_type:', extractedData.item_type)
        sfLog('calories:', extractedData.calories)
        sfGroupEnd()

        const totalTime = Date.now() - startTime
        sfLog('Total extraction time (ms):', totalTime)
        sfLog('--- SMART-FILL DEBUG END ---')
        sfGroupEnd()

        return {
            success: true,
            data: extractedData,
        }
    } catch (error) {
        console.error('--- SMART-FILL ERROR ---')
        console.error('Stage: Main extraction flow')
        console.error('Error:', error)
        sfGroupEnd()
        return {
            error: error.message || 'Failed to extract product details. Please fill in the form manually.',
        }
    }
}
