import { generateId } from '../utils'
import { emptyNutrients } from './nutrients'

// Open Food Facts — free, no API key, global product database
// Stores most nutrients in g/100g, so minerals/vitamins need unit conversion

const OFF_MAP = {
  'energy-kcal_100g':         { key: 'calories',           factor: 1       },
  'proteins_100g':            { key: 'protein',            factor: 1       },
  'carbohydrates_100g':       { key: 'carbs',              factor: 1       },
  'fat_100g':                 { key: 'fat',                factor: 1       },
  'fiber_100g':               { key: 'fiber',              factor: 1       },
  'sugars_100g':              { key: 'sugar',              factor: 1       },
  'saturated-fat_100g':       { key: 'saturatedFat',       factor: 1       },
  'monounsaturated-fat_100g': { key: 'monounsaturatedFat', factor: 1       },
  'polyunsaturated-fat_100g': { key: 'polyunsaturatedFat', factor: 1       },
  'trans-fat_100g':           { key: 'transFat',           factor: 1       },
  'cholesterol_100g':         { key: 'cholesterol',        factor: 1000    }, // g → mg
  'salt_100g':                { key: 'salt',               factor: 1       }, // g → g
  'sodium_100g':              { key: 'sodium',             factor: 1000    }, // g → mg
  'potassium_100g':           { key: 'potassium',          factor: 1000    }, // g → mg
  'calcium_100g':             { key: 'calcium',            factor: 1000    }, // g → mg
  'iron_100g':                { key: 'iron',               factor: 1000    }, // g → mg
  'magnesium_100g':           { key: 'magnesium',          factor: 1000    }, // g → mg
  'phosphorus_100g':          { key: 'phosphorus',         factor: 1000    }, // g → mg
  'zinc_100g':                { key: 'zinc',               factor: 1000    }, // g → mg
  'copper_100g':              { key: 'copper',             factor: 1000    }, // g → mg
  'manganese_100g':           { key: 'manganese',          factor: 1000    }, // g → mg
  'selenium_100g':            { key: 'selenium',           factor: 1000000 }, // g → mcg
  'vitamin-a_100g':           { key: 'vitaminA',           factor: 1000000 }, // g → mcg
  'vitamin-c_100g':           { key: 'vitaminC',           factor: 1000    }, // g → mg
  'vitamin-d_100g':           { key: 'vitaminD',           factor: 1000000 }, // g → mcg
  'vitamin-e_100g':           { key: 'vitaminE',           factor: 1000    }, // g → mg
  'vitamin-k_100g':           { key: 'vitaminK',           factor: 1000000 }, // g → mcg
  'vitamin-b1_100g':          { key: 'vitaminB1',          factor: 1000    }, // g → mg
  'vitamin-b2_100g':          { key: 'vitaminB2',          factor: 1000    }, // g → mg
  'vitamin-pp_100g':          { key: 'vitaminB3',          factor: 1000    }, // g → mg
  'pantothenic-acid_100g':    { key: 'vitaminB5',          factor: 1000    }, // g → mg
  'vitamin-b6_100g':          { key: 'vitaminB6',          factor: 1000    }, // g → mg
  'vitamin-b12_100g':         { key: 'vitaminB12',         factor: 1000000 }, // g → mcg
  'folates_100g':             { key: 'folate',             factor: 1000000 }, // g → mcg
}

export async function lookupBarcode(barcode) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Network error ${res.status}`)
  const data = await res.json()
  if (data.status === 0) throw new Error('Product not found. Check the barcode number.')
  return parseProduct(data.product)
}

function parseProduct(product) {
  const nutrients = emptyNutrients()
  const n = product.nutriments ?? {}

  for (const [offKey, { key, factor }] of Object.entries(OFF_MAP)) {
    if (n[offKey] != null) {
      nutrients[key] = n[offKey] * factor
    }
  }

  const name = product.product_name
    || product.product_name_pl
    || product.product_name_en
    || 'Unknown product'

  return { id: generateId(), name, ...nutrients }
}
