import { useLocalStorage } from './useLocalStorage'
import { NUTRIENT_CONFIG } from '../data/nutrients'

const DEFAULTS = Object.fromEntries(NUTRIENT_CONFIG.map(n => [n.key, 0]))

export function useGoals() {
  const [goals, setGoals] = useLocalStorage('macro-goals', DEFAULTS)

  function setGoal(key, value) {
    setGoals(prev => ({ ...prev, [key]: value }))
  }

  function applyAll(newGoals) {
    setGoals(prev => ({ ...prev, ...newGoals }))
  }

  return { goals, setGoal, applyAll }
}
