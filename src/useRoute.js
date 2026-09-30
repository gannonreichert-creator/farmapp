import { useEffect, useState } from 'react'

// Tiny hash router: #/  #/new  #/m/<id>  #/m/<id>/edit
// Using the URL hash makes the phone's Back button work as expected.
export function useRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'new') return { name: 'new' }
  if (parts[0] === 'm' && parts[1]) return { name: parts[2] === 'edit' ? 'edit' : 'detail', id: parts[1] }
  return { name: 'list' }
}

export const go = (path) => {
  window.location.hash = path
}
export const back = () => window.history.back()
