// All data lives on the phone in IndexedDB (the browser's built-in database).
const DB_NAME = 'farmapp'
const STORE = 'machines'

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run(mode, fn) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = fn(tx.objectStore(STORE))
    tx.oncomplete = () => {
      db.close()
      resolve(req?.result)
    }
    tx.onerror = tx.onabort = () => {
      db.close()
      reject(tx.error)
    }
  })
}

export const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)

export async function listMachines() {
  const all = await run('readonly', (s) => s.getAll())
  return all.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
}

export const getMachine = (id) => run('readonly', (s) => s.get(id))

export async function saveMachine(machine) {
  const now = Date.now()
  const record = { ...machine, id: machine.id || newId(), updatedAt: now, createdAt: machine.createdAt || now }
  await run('readwrite', (s) => s.put(record))
  return record
}

export const deleteMachine = (id) => run('readwrite', (s) => s.delete(id))

// Ask the browser not to clear our data when the phone is low on space.
export async function requestPersistence() {
  try {
    await navigator.storage?.persist?.()
  } catch {
    /* not supported – fine */
  }
}
