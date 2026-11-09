const DB_NAME = 'tpi115-offline'
const STORE = 'sync-queue'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () =>
      req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function enqueue(path, method, body) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).add({ path, method, body, queuedAt: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function pendingCount() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function flush(apiBase = '/api') {
  const db = await openDb()
  const items = await new Promise((resolve, reject) => {
    const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  const results = []
  for (const item of items) {
    try {
      const res = await fetch(`${apiBase}${item.path}`, {
        method: item.method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: item.body !== undefined ? JSON.stringify(item.body) : undefined,
      })
      if (!res.ok) {
        results.push({ id: item.id, ok: false, status: res.status })
        continue
      }
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).delete(item.id)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
      results.push({ id: item.id, ok: true })
    } catch {
      results.push({ id: item.id, ok: false, offline: true })
      break
    }
  }
  return results
}
