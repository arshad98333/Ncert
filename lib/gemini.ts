import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSystemPrompt } from "@/constants/prompts"

// NCERT Rational Numbers Chapter 1 curriculum content
const CURRICULUM_CONTENT = `
RATIONAL NUMBERS - CHAPTER 1 (NCERT Grade 1)

Introduction:
In Mathematics, we frequently come across simple equations to be solved. For example, the equation x + 2 = 13 is solved when x = 11. The solution 11 is a natural number. On the other hand, for the equation x + 5 = 5, the solution gives the whole number 0 (zero).

To solve equations like x + 18 = 5, we require the number –13 which is not a whole number. This led us to think of integers (positive and negative). For equations like 2x = 3 or 5x + 7 = 0, we need numbers like 3/2 and -7/5. This leads us to the collection of rational numbers.

Key Concepts:

1. CLOSURE PROPERTY
- Rational numbers are closed under addition, subtraction, and multiplication
- Example: 3/7 + (-5/7) = -2/7 (still a rational number)
- NOT closed under division (cannot divide by zero)

2. COMMUTATIVITY
- Addition: a + b = b + a (Example: 2/3 + 5/7 = 5/7 + 2/3)
- Multiplication: a × b = b × a
- Subtraction and Division are NOT commutative

3. ASSOCIATIVITY
- Addition: (a + b) + c = a + (b + c)
- Multiplication: (a × b) × c = a × (b × c)
- Subtraction and Division are NOT associative

4. ROLE OF ZERO AND ONE
- Zero (0) is the additive identity: a + 0 = a
- One (1) is the multiplicative identity: a × 1 = a

5. DISTRIBUTIVITY
- a × (b + c) = (a × b) + (a × c)
- a × (b - c) = (a × b) - (a × c)
`

function getModelCandidates(guruMode: boolean) {
  const envModel = typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_GEMINI_MODEL
  if (envModel) {
    // If user provided a model, try it first, then sensible fallbacks
    const fallback = guruMode
      ? [
          "gemini-1.5-pro",
          "gemini-1.5-flash",
          "gemini-1.5-flash-latest",
          "gemini-1.5-flash-8b",
          "gemini-2.0-flash-lite-preview",
        ]
      : [
          "gemini-1.5-flash",
          "gemini-1.5-flash-latest",
          "gemini-1.5-flash-8b",
          "gemini-1.5-pro",
          "gemini-2.0-flash-lite-preview",
        ]
    return Array.from(new Set([envModel, ...fallback]))
  }
  // Default ordering by mode
  const ordered = guruMode
    ? [
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-8b",
        "gemini-2.0-flash-lite-preview",
      ]
    : [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
        "gemini-2.0-flash-lite-preview",
      ]
  // Merge with BASE_MODELS to preserve any future additions without duplicates
  return Array.from(new Set([...ordered]))
}

function postProcessSteps(markdown: string): string {
  // Bold key subheadings
  let result = markdown
    .replace(/(^|\n)\s*Concept\s*:\s*/gi, (m, p1) => `${p1}**Concept:** `)
    .replace(/(^|\n)\s*Goal\s*:\s*/gi, (m, p1) => `${p1}**Goal:** `)
    .replace(/(^|\n)\s*Prerequisites\s*:\s*/gi, (m, p1) => `${p1}**Prerequisites:** `)
    .replace(/(^|\n)\s*Step-?by-?Step\s*:\s*/gi, (m, p1) => `${p1}**Step-by-Step:** `)
    .replace(/(^|\n)\s*Summary\s*:\s*/gi, (m, p1) => `${p1}**Summary:** `)
    .replace(/(^|\n)\s*Practice\s*:\s*/gi, (m, p1) => `${p1}**Practice:** `)

  // Bold "Step X:" headings
  result = result.replace(/(^|\n)\s*(Step\s+\d+\s*:)\s*/gi, (m, p1, p2) => `${p1}**${p2}** `)

  // Ensure a single blank line after each Step line
  result = result.replace(/(\*\*Step\s+\d+\s*:[^\n]*\n)(?!\n)/gi, ($0, line) => `${line}\n`)
  return result
}

function normalizeErr(err: any) {
  const message = String(err?.message || "")
  const lower = message.toLowerCase()
  const status =
    (err?.status as number | undefined) ??
    (err?.response?.status as number | undefined) ??
    (err?.cause?.status as number | undefined)
  return { message, lower, status }
}

function isInvalidKeyError(err: any) {
  const { lower, status } = normalizeErr(err)
  if (isReferrerRestrictionError(err)) return false
  return (
    status === 401 &&
    (lower.includes("api key not valid") ||
      lower.includes("invalid api key") ||
      lower.includes("invalid key") ||
      lower.includes("unauthorized") ||
      lower.includes("missing api key") ||
      lower.includes("apikey_invalid"))
  )
}

function isReferrerRestrictionError(err: any) {
  const { lower, status } = normalizeErr(err)
  return (
    (status === 403 || status === 401) &&
    (lower.includes("referrer") ||
      lower.includes("referer") ||
      lower.includes("http referrer") ||
      lower.includes("origin not allowed") ||
      lower.includes("restriction") ||
      lower.includes("not allowed for this api key"))
  )
}

function isQuotaOrBillingError(err: any) {
  const { lower, status } = normalizeErr(err)
  return (
    status === 429 ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("exceeded") ||
    lower.includes("billing") ||
    lower.includes("insufficient authentication scope")
  )
}

function isModelNotFoundError(err: any) {
  const { lower, status } = normalizeErr(err)
  return status === 404 || (lower.includes("model") && lower.includes("not found"))
}

function isNetworkOrCorsError(err: any) {
  const { lower } = normalizeErr(err)
  return (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("cors") ||
    lower.includes("timeout") ||
    lower.includes("blocked by client")
  )
}

function mapErrorToUserMessage(err: any): string {
  if (isInvalidKeyError(err)) {
    return "Invalid API key. Double-check the key in Google AI Studio and try again."
  }
  if (isReferrerRestrictionError(err)) {
    const origin = typeof window !== "undefined" ? window.location.origin : "your site origin"
    return `Your API key is restricted by HTTP referrer and this origin isn't allowed (${origin}). In Google AI Studio → API Keys, edit your key and add this origin to Allowed referrers.`
  }
  if (isModelNotFoundError(err)) {
    return "Selected Gemini model is unavailable. Try again later or set NEXT_PUBLIC_GEMINI_MODEL to a supported model like gemini-1.5-flash."
  }
  if (isQuotaOrBillingError(err)) {
    return "Request blocked due to quota or billing. Check Usage & Billing in Google AI Studio and ensure your project has available quota."
  }
  const { lower } = normalizeErr(err)
  if (lower.includes("api keys are not supported")) {
    return "This endpoint requires OAuth instead of API keys. Ensure you are using the @google/generative-ai SDK (Gemini API) with a Gemini API key from AI Studio."
  }
  if (isNetworkOrCorsError(err)) {
    return "Network/CORS issue while contacting Gemini. Check your connection and browser console for CORS details."
  }
  const msg = String(err?.message || "").trim()
  return msg && msg.length < 200 ? msg : "Unexpected error contacting Gemini."
}

async function selectUsableModelName(genAI: GoogleGenerativeAI, guruMode: boolean): Promise<string> {
  const generationConfig = {
    temperature: guruMode ? 0.1 : 0.7,
    maxOutputTokens: 8,
  }
  const candidates = getModelCandidates(guruMode)

  let lastErr: any = null
  for (const modelName of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig })
      await model.generateContent("hello")
      return modelName
    } catch (err: any) {
      if (isInvalidKeyError(err)) throw err
      if (isModelNotFoundError(err)) {
        lastErr = err
        continue
      }
      lastErr = err
    }
  }
  throw lastErr || new Error("No available Gemini model")
}

export async function sendMessage(
  apiKey: string,
  message: string,
  guruMode: boolean,
  conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }>,
) {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const modelName = await selectUsableModelName(genAI, guruMode)

    const generationConfig = {
      temperature: guruMode ? 0.1 : 0.7,
      maxOutputTokens: guruMode ? 2048 : 1024,
    }

    // Create model with systemInstruction to avoid chatty prefaces
    const systemInstruction = getSystemPrompt({ guruMode, pdfContent: CURRICULUM_CONTENT })
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
      generationConfig,
    })

    const chat = model.startChat({
      history: [...conversationHistory],
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()
    return postProcessSteps(text)
  } catch (error: any) {
    throw new Error(mapErrorToUserMessage(error))
  }
}

export async function sendMessageStream(
  apiKey: string,
  message: string,
  guruMode: boolean,
  conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }>,
  onDelta: (deltaText: string) => void,
): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const modelName = await selectUsableModelName(genAI, guruMode)

    const generationConfig = {
      temperature: guruMode ? 0.1 : 0.7,
      maxOutputTokens: guruMode ? 2048 : 1024,
    }

    const systemInstruction = getSystemPrompt({ guruMode, pdfContent: CURRICULUM_CONTENT })
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
      generationConfig,
    })

    const chat = model.startChat({
      history: [...conversationHistory],
    })

    // Stream the response
    const streamResult = await chat.sendMessageStream(message)
    let fullText = ""
    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text()
      if (chunkText) {
        fullText += chunkText
        const processed = postProcessSteps(chunkText)
        onDelta(processed)
      }
    }
    return postProcessSteps(fullText)
  } catch (error: any) {
    throw new Error(mapErrorToUserMessage(error))
  }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    await selectUsableModelName(genAI, false) // probe with fallbacks
    return true
  } catch (err: any) {
    if (isInvalidKeyError(err)) return false
    throw new Error(mapErrorToUserMessage(err))
  }
}
