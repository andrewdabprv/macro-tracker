// Central nutrient config. Every nutrient tracked in the app is defined here.
// All values are per 100g.
// To add/remove a nutrient, change only this file.

export const NUTRIENT_CONFIG = [
  // --- Macros ---
  { key: 'calories',            label: 'Calories',              unit: 'kcal', group: 'Macros' },
  { key: 'protein',             label: 'Protein',               unit: 'g',    group: 'Macros' },
  { key: 'carbs',               label: 'Carbohydrates',         unit: 'g',    group: 'Macros' },
  { key: 'fat',                 label: 'Fat',                   unit: 'g',    group: 'Macros' },

  // --- Carb breakdown ---
  { key: 'fiber',               label: 'Fiber',                 unit: 'g',    group: 'Carbohydrates' },
  { key: 'sugar',               label: 'Sugar',                 unit: 'g',    group: 'Carbohydrates' },

  // --- Fat breakdown ---
  { key: 'saturatedFat',        label: 'Saturated Fat',         unit: 'g',    group: 'Fats' },
  { key: 'monounsaturatedFat',  label: 'Monounsaturated Fat',   unit: 'g',    group: 'Fats' },
  { key: 'polyunsaturatedFat',  label: 'Polyunsaturated Fat',   unit: 'g',    group: 'Fats' },
  { key: 'transFat',            label: 'Trans Fat',             unit: 'g',    group: 'Fats' },
  { key: 'cholesterol',         label: 'Cholesterol',           unit: 'mg',   group: 'Fats' },

  // --- Electrolytes ---
  { key: 'salt',                label: 'Salt',                  unit: 'g',    group: 'Electrolytes' },
  { key: 'sodium',              label: 'Sodium',                unit: 'mg',   group: 'Electrolytes' },
  { key: 'potassium',           label: 'Potassium',             unit: 'mg',   group: 'Electrolytes' },

  // --- Minerals ---
  { key: 'calcium',             label: 'Calcium',               unit: 'mg',   group: 'Minerals' },
  { key: 'iron',                label: 'Iron',                  unit: 'mg',   group: 'Minerals' },
  { key: 'magnesium',           label: 'Magnesium',             unit: 'mg',   group: 'Minerals' },
  { key: 'phosphorus',          label: 'Phosphorus',            unit: 'mg',   group: 'Minerals' },
  { key: 'zinc',                label: 'Zinc',                  unit: 'mg',   group: 'Minerals' },
  { key: 'copper',              label: 'Copper',                unit: 'mg',   group: 'Minerals' },
  { key: 'manganese',           label: 'Manganese',             unit: 'mg',   group: 'Minerals' },
  { key: 'selenium',            label: 'Selenium',              unit: 'mcg',  group: 'Minerals' },

  // --- Vitamins ---
  { key: 'vitaminA',            label: 'Vitamin A',             unit: 'mcg',  group: 'Vitamins' },
  { key: 'vitaminC',            label: 'Vitamin C',             unit: 'mg',   group: 'Vitamins' },
  { key: 'vitaminD',            label: 'Vitamin D',             unit: 'mcg',  group: 'Vitamins' },
  { key: 'vitaminE',            label: 'Vitamin E',             unit: 'mg',   group: 'Vitamins' },
  { key: 'vitaminK',            label: 'Vitamin K',             unit: 'mcg',  group: 'Vitamins' },
  { key: 'vitaminB1',           label: 'Vitamin B1 (Thiamin)',  unit: 'mg',   group: 'Vitamins' },
  { key: 'vitaminB2',           label: 'Vitamin B2 (Riboflavin)', unit: 'mg', group: 'Vitamins' },
  { key: 'vitaminB3',           label: 'Vitamin B3 (Niacin)',   unit: 'mg',   group: 'Vitamins' },
  { key: 'vitaminB5',           label: 'Vitamin B5',            unit: 'mg',   group: 'Vitamins' },
  { key: 'vitaminB6',           label: 'Vitamin B6',            unit: 'mg',   group: 'Vitamins' },
  { key: 'vitaminB12',          label: 'Vitamin B12',           unit: 'mcg',  group: 'Vitamins' },
  { key: 'folate',              label: 'Folate',                unit: 'mcg',  group: 'Vitamins' },
]

// USDA FoodData Central nutrient ID → our field key
// Used when parsing API responses
export const USDA_NUTRIENT_MAP = {
  1008: 'calories',
  1003: 'protein',
  1005: 'carbs',
  1004: 'fat',
  1079: 'fiber',
  2000: 'sugar',
  1258: 'saturatedFat',
  1292: 'monounsaturatedFat',
  1293: 'polyunsaturatedFat',
  1257: 'transFat',
  1253: 'cholesterol',
  1093: 'sodium',
  1092: 'potassium',
  1087: 'calcium',
  1089: 'iron',
  1090: 'magnesium',
  1091: 'phosphorus',
  1095: 'zinc',
  1098: 'copper',
  1101: 'manganese',
  1103: 'selenium',
  1106: 'vitaminA',
  1162: 'vitaminC',
  1114: 'vitaminD',
  1109: 'vitaminE',
  1185: 'vitaminK',
  1165: 'vitaminB1',
  1166: 'vitaminB2',
  1167: 'vitaminB3',
  1170: 'vitaminB5',
  1175: 'vitaminB6',
  1178: 'vitaminB12',
  1190: 'folate',
}

// EU/WHO daily reference intakes — used for the nutrition analysis bars
export const DAILY_REF = {
  calories:           2000,
  protein:            50,
  carbs:              260,
  fat:                70,
  fiber:              25,
  sugar:              90,
  saturatedFat:       20,
  monounsaturatedFat: 35,
  polyunsaturatedFat: 20,
  transFat:           2.2,
  cholesterol:        300,
  salt:               6,
  sodium:             2400,
  potassium:          2000,
  calcium:            800,
  iron:               14,
  magnesium:          375,
  phosphorus:         700,
  zinc:               10,
  copper:             1,
  manganese:          2,
  selenium:           55,
  vitaminA:           800,
  vitaminC:           80,
  vitaminD:           5,
  vitaminE:           12,
  vitaminK:           75,
  vitaminB1:          1.1,
  vitaminB2:          1.4,
  vitaminB3:          16,
  vitaminB5:          6,
  vitaminB6:          1.4,
  vitaminB12:         2.5,
  folate:             200,
}

// Per-100g thresholds for 4-state bar: [yellow, orange, red]
// green = below yellow, yellow = yellow–orange, orange = orange–red, red = above red
export const BAR_THRESHOLDS = {
  calories:           [80,   200,  350 ],
  protein:            [5,    15,   25  ],
  carbs:              [15,   30,   50  ],
  fat:                [5,    15,   30  ],
  fiber:              [2,    5,    10  ],
  sugar:              [5,    12,   25  ],  // 33g jam → red ✓
  saturatedFat:       [1.5,  5,    10  ],
  monounsaturatedFat: [5,    15,   30  ],
  polyunsaturatedFat: [5,    10,   20  ],
  transFat:           [0.1,  0.5,  1   ],
  cholesterol:        [20,   60,   100 ],
  salt:               [0.3,  0.75, 1.5 ],
  sodium:             [120,  300,  600 ],
  potassium:          [100,  250,  400 ],
  calcium:            [50,   150,  300 ],
  iron:               [1,    4,    8   ],
  magnesium:          [20,   50,   100 ],
  phosphorus:         [50,   150,  300 ],
  zinc:               [1,    3,    7   ],
  copper:             [0.1,  0.3,  0.7 ],
  manganese:          [0.3,  1,    2.5 ],
  selenium:           [5,    20,   40  ],
  vitaminA:           [50,   200,  500 ],
  vitaminC:           [10,   30,   60  ],
  vitaminD:           [0.5,  2,    5   ],
  vitaminE:           [2,    5,    10  ],
  vitaminK:           [20,   80,   200 ],
  vitaminB1:          [0.1,  0.3,  0.8 ],
  vitaminB2:          [0.1,  0.3,  0.7 ],
  vitaminB3:          [1.5,  5,    12  ],
  vitaminB5:          [0.5,  1.5,  4   ],
  vitaminB6:          [0.1,  0.4,  1   ],
  vitaminB12:         [0.3,  1,    3   ],
  folate:             [20,   60,   150 ],
}

// Returns a zeroed-out nutrient object (useful as a default/fallback)
export function emptyNutrients() {
  return Object.fromEntries(NUTRIENT_CONFIG.map(n => [n.key, 0]))
}

// Groups the config array by group name, preserving order
export function getNutrientGroups() {
  const groups = {}
  for (const n of NUTRIENT_CONFIG) {
    if (!groups[n.group]) groups[n.group] = []
    groups[n.group].push(n)
  }
  return groups
}
