import { useLocalStorage } from './useLocalStorage'
import { generateId } from '../utils'
import { NUTRIENT_CONFIG } from '../data/nutrients'

export function useMeals() {
  const [meals, setMeals] = useLocalStorage('meals', [])

  function addMeal(meal) {
    const entry = { ...meal, id: generateId() }
    setMeals(prev => [...prev, entry])
    return entry
  }

  function updateMeal(id, changes) {
    setMeals(prev => prev.map(m => m.id === id ? { ...m, ...changes } : m))
  }

  function deleteMeal(id) {
    setMeals(prev => prev.filter(m => m.id !== id))
  }

  function mealTotals(meal) {
    const totals = {}
    for (const ing of meal.ingredients) {
      const factor = ing.grams / 100
      for (const { key } of NUTRIENT_CONFIG) {
        totals[key] = (totals[key] ?? 0) + (ing.foodSnapshot[key] ?? 0) * factor
      }
    }
    return totals
  }

  return { meals, addMeal, updateMeal, deleteMeal, mealTotals }
}
