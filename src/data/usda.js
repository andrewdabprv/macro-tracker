import { USDA_NUTRIENT_MAP, emptyNutrients } from './nutrients'
import { generateId } from '../utils'

// Get a free key at https://fdc.nal.usda.gov/api-key-signup.html
// DEMO_KEY works but has low rate limits (30 req/hr)
const API_KEY = 'DWuJn0q76CbJu5MPaCbW7TSIvgzqlXsXF4Y1kDze'

// Only these data types have reliable per-100g nutrient data
const DATA_TYPES = 'Foundation,SR%20Legacy'

export async function searchUSDA(query) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&dataType=${DATA_TYPES}&pageSize=20&api_key=${API_KEY}`
  const res = await fetch(url)
  if (res.status === 429) throw new Error('Rate limited — get a free API key at fdc.nal.usda.gov/api-key-signup.html')
  if (res.status === 403) throw new Error('API key invalid or rate limit exceeded')
  if (!res.ok) throw new Error(`USDA error ${res.status}`)
  const data = await res.json()
  return (data.foods ?? []).map(parseUSDAFood)
}

// Convert a USDA food object into our internal format
function parseUSDAFood(food) {
  const nutrients = emptyNutrients()

  for (const n of food.foodNutrients ?? []) {
    const key = USDA_NUTRIENT_MAP[n.nutrientId]
    if (key && n.value != null) {
      nutrients[key] = n.value
    }
  }

  return {
    id: generateId(),
    name: food.description,
    fdcId: food.fdcId,
    ...nutrients,
  }
}
