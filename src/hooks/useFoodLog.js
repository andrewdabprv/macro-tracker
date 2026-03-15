import { useLocalStorage } from './useLocalStorage'
import { NUTRIENT_CONFIG, emptyNutrients } from '../data/nutrients'
import { generateId } from '../utils'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function useFoodLog(date) {
  const [log, setLog] = useLocalStorage('food-log', [])
  const activeDate = date ?? todayKey()

  const entries = log.filter(e => e.date === activeDate)

  function logFood(food, grams = 100) {
    const entry = {
      id: generateId(),
      foodId: food.id,
      foodSnapshot: {
        name: food.name,
        ...Object.fromEntries(NUTRIENT_CONFIG.map(n => [n.key, food[n.key] ?? 0]))
      },
      grams,
      date: activeDate,
    }
    setLog(prev => [...prev, entry])
  }

  function removeEntry(id) {
    setLog(prev => prev.filter(e => e.id !== id))
  }

  function updateGrams(id, grams) {
    setLog(prev => prev.map(e => e.id === id ? { ...e, grams } : e))
  }

  const totals = entries.reduce((acc, e) => {
    const factor = e.grams / 100
    for (const { key } of NUTRIENT_CONFIG) {
      acc[key] = (acc[key] ?? 0) + (e.foodSnapshot[key] ?? 0) * factor
    }
    return acc
  }, emptyNutrients())

  return { entries, totals, logFood, removeEntry, updateGrams }
}
