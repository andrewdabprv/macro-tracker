import { useLocalStorage } from './useLocalStorage'

export function useBodyWeight() {
  const [entries, setEntries] = useLocalStorage('body-weight', [])

  function logWeight(date, weight) {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.date === date)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { date, weight }
        return updated
      }
      return [...prev, { date, weight }]
    })
  }

  function removeWeight(date) {
    setEntries(prev => prev.filter(e => e.date !== date))
  }

  function getWeight(date) {
    return entries.find(e => e.date === date)?.weight ?? null
  }

  function getRecentEntries(days = 7) {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = d.toISOString().slice(0, 10)
      result.push({ date, weight: entries.find(e => e.date === date)?.weight ?? null })
    }
    return result
  }

  return { logWeight, removeWeight, getWeight, getRecentEntries }
}
