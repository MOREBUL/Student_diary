import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const isBrowser = typeof window !== 'undefined'

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser) return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (!isBrowser) return
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // ignored — storage can be full или отключено
    }
  }, [isBrowser, key, storedValue])

  return [storedValue, setStoredValue] as const
}

