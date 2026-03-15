import { useLocalStorage } from './useLocalStorage'
import { generateId } from '../utils'

// A food entry in the database
// { id, name, calories, protein, carbs, fat, serving }
// serving is just a label e.g. "100g", "1 cup"

export function useFoods() {
  const [foods, setFoods] = useLocalStorage('foods', [])

  function addFood(food) {
    const entry = { ...food, id: generateId() }
    setFoods(prev => [...prev, entry])
    return entry
  }

  function updateFood(id, changes) {
    setFoods(prev => prev.map(f => f.id === id ? { ...f, ...changes } : f))
  }

  function deleteFood(id) {
    setFoods(prev => prev.filter(f => f.id !== id))
  }

  return { foods, addFood, updateFood, deleteFood }
}
