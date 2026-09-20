const GEMINI_MODEL = 'gemini-2.5-flash'

const MAX_IMAGE_BYTES = 4 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: [
        'plant',
        'flower',
        'herb',
        'tree',
        'fruit',
        'vegetable',
        'food',
        'unknown',
      ],
    },

    commonName: { type: 'string' },
    scientificName: { type: 'string' },
    family: { type: 'string' },

    confidenceScore: { type: 'number' },

    uncertainIdentification: {
      type: 'boolean',
    },

    uncertaintyNote: {
      type: 'string',
    },

    shortDescription: {
      type: 'string',
    },

    medicinalUses: {
      type: 'array',
      items: { type: 'string' },
    },

    conditionsStudiedOrTraditionalUses: {
      type: 'array',
      items: { type: 'string' },
    },

    evidenceNotes: {
      type: 'string',
    },

    nutritionalHighlights: {
      type: 'array',
      items: { type: 'string' },
    },

    dietaryBenefits: {
      type: 'array',
      items: { type: 'string' },
    },

    preparationAndFoodUse: {
      type: 'array',
      items: { type: 'string' },
    },

    safetyWarnings: {
      type: 'array',
      items: { type: 'string' },
    },

    drugInteractions: {
      type: 'array',
      items: { type: 'string' },
    },

    toxicityInformation: {
      type: 'array',
      items: { type: 'string' },
    },

    botanicalFeatures: {
      type: 'array',
      items: { type: 'string' },
    },

    careGuide: {
      type: 'array',
      items: { type: 'string' },
    },

    possibleLookAlikes: {
      type: 'array',
      items: { type: 'string' },
    },
  },

  required: [
    'category',
    'commonName',
    'scientificName',
    'family',
    'confidenceScore',
    'uncertainIdentification',
    'uncertaintyNote',
    'shortDescription',
    'medicinalUses',
    'conditionsStudiedOrTraditionalUses',
    'evidenceNotes',
    'nutritionalHighlights',
    'dietaryBenefits',
    'preparationAndFoodUse',
    'safetyWarnings',
    'drugInteractions',
    'toxicityInformation',
    'botanicalFeatures',
    'careGuide',
    'possibleLookAlikes',
  ],
}

const SYSTEM_INSTRUCTION = `
You are FloraVision AI, a cautious botanical identification assistant.

Identify the visible specimen as accurately as possible from the image.

The specimen may be:
- a plant
- flower
- herb
- tree
- fruit
- vegetable
- food plant

Do not invent an identification.

If the image is unclear, the specimen cannot be reliably identified,
or several species are plausible, set uncertainIdentification to true
and explain the uncertainty.

MEDICAL INFORMATION:

Provide useful information about documented medicinal research and
traditional uses when relevant.

Do not claim that a plant definitely cures, prevents, or treats a disease.

Clearly distinguish traditional uses from scientific evidence.

Do not provide individualized medical treatment plans.

Do not provide personalized medication or dosing instructions.

Mention important safety warnings, toxicity, allergies, pregnancy concerns,
children's safety, and possible drug interactions when relevant.

If evidence is limited, uncertain, mixed, or based mainly on traditional use,
state that clearly.

FOOD INFORMATION:

For fruits and vegetables, provide useful nutritional information and
common food preparation or food uses.

Never assume that an unidentified plant is safe to eat.

IDENTIFICATION:

Use visible characteristics from the image.

Do not fabricate scientific names, plant families, medicinal compounds,
diseases, or safety information.

Return only the requested structured JSON.
`

function jsonResponse(body, status = 200, origin = '') {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  }

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  }

  return new Response(JSON.stringify(body), {
    status,
    headers,
  })
}

function getAllowedOrigin(origin) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!origin) {
    return ''
  }

  if (allowedOrigins.includes('*')) {
    return origin
  }

  if (allowedOrigins.includes(origin)) {
    return origin
  }

  return ''
}

function isValidBase64(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    /^[A-Za-z0-9+/]*={0,2}$/.test(value)
  )
}

function getApproximateBytes(base64) {
  return Math.ceil((base64.length * 3) / 4)
}

export default async function handler(request) {
  const origin = request.headers.get('origin') || ''
  const allowedOrigin = getAllowedOrigin(origin)

  if (request.method === 'OPTIONS') {
    const headers = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }

    if (allowedOrigin) {
      headers['Access-Control-Allow-Origin'] = allowedOrigin
      headers['Vary'] = 'Origin'
    }

    return new Response(null, {
      status: 204,
      headers,
    })
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'Method not allowed.',
      },
      405,
      allowedOrigin,
    )
  }

  const geminiApiKey = process.env.GEMINI_API_KEY

  if (!geminiApiKey) {
    return jsonResponse(
      {
        error: 'The AI service is not configured yet.',
      },
      500,
      allowedOrigin,
    )
  }

  let body

  try {
    body = await request.json()
  } catch {
    return jsonResponse(
      {
        error: 'Invalid request body.',
      },
      400,
      allowedOrigin,
    )
  }

  const imageBase64 = body?.imageBase64
  const mimeType = body?.mimeType

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return jsonResponse(
      {
        error: 'Unsupported image type. Please use JPEG, PNG, or WebP.',
      },
      400,
      allowedOrigin,
    )
  }

  if (!isValidBase64(imageBase64)) {
    return jsonResponse(
      {
        error: 'Invalid image data.',
      },
      400,
      allowedOrigin,
    )
  }

  if (getApproximateBytes(imageBase64) > MAX_IMAGE_BYTES) {
    return jsonResponse(
      {
        error: 'Image is too large. Please use an image under 4 MB.',
      },
      413,
      allowedOrigin,
    )
  }

  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, 45000)

  try {
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/` +
      `${GEMINI_MODEL}:generateContent`

    const response = await fetch(endpoint, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },

      signal: controller.signal,

      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: SYSTEM_INSTRUCTION,
            },
          ],
        },

        contents: [
          {
            role: 'user',

            parts: [
              {
                text:
                  'Identify this specimen and return the complete FloraVision AI result.',
              },

              {
                inlineData: {
                  mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],

        generationConfig: {
          responseMimeType: 'application/json',

          responseSchema: RESULT_SCHEMA,

          temperature: 0.2,
        },
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const message =
        data?.error?.message ||
        'The Gemini service rejected the request.'

      return jsonResponse(
        {
          error: message,
        },
        response.status >= 500 ? 502 : 400,
        allowedOrigin,
      )
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || '')
        .join('')
        .trim() || ''

    if (!text) {
      return jsonResponse(
        {
          error: 'The AI service returned no identification result.',
        },
        502,
        allowedOrigin,
      )
    }

    let result

    try {
      result = JSON.parse(text)
    } catch {
      return jsonResponse(
        {
          error: 'The AI service returned an invalid structured result.',
        },
        502,
        allowedOrigin,
      )
    }

    return jsonResponse(
      {
        result,
      },
      200,
      allowedOrigin,
    )
  } catch (error) {
    if (error?.name === 'AbortError') {
      return jsonResponse(
        {
          error: 'The AI request timed out. Please try again.',
        },
        504,
        allowedOrigin,
      )
    }

    return jsonResponse(
      {
        error: 'Unable to reach the AI identification service.',
      },
      502,
      allowedOrigin,
    )
  } finally {
    clearTimeout(timeout)
  }
  }
