import { useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  function set(updater) {
    const next = typeof updater === 'function' ? updater(value) : updater
    localStorage.setItem(key, JSON.stringify(next))
    setValue(next)
  }

  return [value, set]
}
