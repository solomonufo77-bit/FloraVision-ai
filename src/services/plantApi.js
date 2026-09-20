const API_URL =
  import.meta.env.VITE_PLANT_API_URL ||
  '/.netlify/functions/analyze-plant'

const MAX_IMAGE_BYTES = 12 * 1024 * 1024

function extractImageData(dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new Error('Invalid image data.')
  }

  const commaIndex = dataUrl.indexOf(',')

  if (commaIndex === -1) {
    throw new Error('Invalid image data format.')
  }

  const header = dataUrl.slice(5, commaIndex)
  const base64 = dataUrl.slice(commaIndex + 1)
  const mimeType = header.split(';')[0] || 'image/jpeg'

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    throw new Error('Please use a JPEG, PNG, or WebP image.')
  }

  const approximateBytes = Math.ceil((base64.length * 3) / 4)

  if (approximateBytes > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large. Please choose a smaller image.')
  }

  return { base64, mimeType }
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) return []

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function cleanConfidence(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) return null

  return Math.max(0, Math.min(100, number))
}

function normalizeResult(raw) {
  const result = raw && typeof raw === 'object' ? raw : {}

  return {
    category: cleanString(result.category),
    commonName: cleanString(result.commonName),
    scientificName: cleanString(result.scientificName),
    family: cleanString(result.family),
    confidenceScore: cleanConfidence(result.confidenceScore),

    uncertainIdentification: Boolean(result.uncertainIdentification),
    uncertaintyNote: cleanString(result.uncertaintyNote),

    shortDescription: cleanString(result.shortDescription),

    medicinalUses: cleanStringArray(result.medicinalUses),
    conditionsStudiedOrTraditionalUses: cleanStringArray(
      result.conditionsStudiedOrTraditionalUses,
    ),
    evidenceNotes: cleanString(result.evidenceNotes),

    nutritionalHighlights: cleanStringArray(result.nutritionalHighlights),
    dietaryBenefits: cleanStringArray(result.dietaryBenefits),
    preparationAndFoodUse: cleanStringArray(result.preparationAndFoodUse),

    safetyWarnings: cleanStringArray(result.safetyWarnings),
    drugInteractions: cleanStringArray(result.drugInteractions),
    toxicityInformation: cleanStringArray(result.toxicityInformation),

    botanicalFeatures: cleanStringArray(result.botanicalFeatures),
    careGuide: cleanStringArray(result.careGuide),
    possibleLookAlikes: cleanStringArray(result.possibleLookAlikes),
  }
}

export async function analyzePlantImage(dataUrl) {
  const { base64, mimeType } = extractImageData(dataUrl)

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64: base64,
      mimeType,
    }),
  })

  let payload = null

  try {
    payload = await response.json()
  } catch {
    throw new Error('The identification service returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(
      cleanString(payload?.error) ||
        'The identification service could not process the image.',
    )
  }

  if (!payload?.result) {
    throw new Error('The identification service returned no result.')
  }

  return normalizeResult(payload.result)
  }
      
