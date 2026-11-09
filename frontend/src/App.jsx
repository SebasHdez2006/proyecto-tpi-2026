import { useCallback, useEffect, useState } from 'react'
import { api, API_BASE } from './api'
import { enqueue, flush, pendingCount } from './syncQueue'
import { useInstallPrompt, useOnline } from './hooks'

export default function App() {
  const online = useOnline()
  const installPrompt = useInstallPrompt()

  const [info, setInfo] = useState(null)
  const [infoError, setInfoError] = useState(null)
  const [username, setUsername] = useState('demo')
  const [session, setSession] = useState(null)
  const [sessionError, setSessionError] = useState(null)
  const [pending, setPending] = useState(0)

  const [localCount, setLocalCount] = useState(
    () => Number(localStorage.getItem('demo-local') || 0),
  )
  const [tabCount, setTabCount] = useState(
    () => Number(sessionStorage.getItem('demo-tab') || 0),
  )
  const [cookieValue, setCookieValue] = useState(
    () => document.cookie.match(/demo_pref=([^;]+)/)?.[1] || '',
  )

  const refreshInfo = useCallback(async () => {
    try {
      setInfo(await api.info())
      setInfoError(null)
    } catch (e) {
      setInfoError(`${e.status ?? ''} ${e.message}`)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const res = await api.session()
      setSession(res.session)
      setSessionError(null)
    } catch (e) {
      if (e.status === 401) setSession(null)
      else setSessionError(e.message)
    }
  }, [])

  const refreshPending = useCallback(async () => {
    setPending(await pendingCount())
  }, [])

  useEffect(() => {
    refreshInfo()
    refreshSession()
    refreshPending()
  }, [refreshInfo, refreshSession, refreshPending])

  useEffect(() => {
    if (!online) return
    flush(API_BASE).then(() => {
      refreshPending()
      refreshSession()
    })
  }, [online, refreshPending, refreshSession])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await api.login(username)
      setSession(res.session)
      setSessionError(null)
    } catch (e2) {
      setSessionError(e2.message)
    }
  }

  const handleLogout = async () => {
    await api.logout()
    setSession(null)
  }

  const queueDemoOp = async () => {
    await enqueue('/v1/session', 'GET')
    refreshPending()
  }

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">TPI115 — PoC</h1>
        <div className="d-flex gap-2 align-items-center">
          <span className={`badge ${online ? 'text-bg-success' : 'text-bg-danger'}`}>
            {online ? 'online' : 'offline'}
          </span>
          {installPrompt && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => installPrompt.prompt()}
            >
              Instalar app
            </button>
          )}
        </div>
      </header>

      <section className="card mb-3">
        <div className="card-body">
          <h2 className="h5 card-title">Nodo que respondió</h2>
          {infoError && <p className="text-danger mb-2">Error: {infoError}</p>}
          {info && (
            <dl className="row mb-2">
              <dt className="col-4">node_id</dt>
              <dd className="col-8"><code>{info.node_id}</code></dd>
              <dt className="col-4">hostname</dt>
              <dd className="col-8"><code>{info.hostname}</code></dd>
              <dt className="col-4">entorno</dt>
              <dd className="col-8">{info.environment}</dd>
            </dl>
          )}
          <button className="btn btn-outline-primary btn-sm" onClick={refreshInfo}>
            Llamar de nuevo
          </button>
          <p className="text-muted small mt-2 mb-0">
            Repetí la llamada: el balanceador reparte entre los 3 nodos.
          </p>
        </div>
      </section>

      <section className="card mb-3">
        <div className="card-body">
          <h2 className="h5 card-title">Sesión compartida (Redis)</h2>
          {session ? (
            <>
              <p className="mb-1">
                Usuario: <strong>{session.username}</strong> — visitas:{' '}
                <strong>{session.visits}</strong>
              </p>
              <p className="mb-2 small text-muted">
                creada en <code>{session.created_on_node}</code>, última atendida
                por <code>{session.last_node}</code>
              </p>
              <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={refreshSession}>
                  +1 visita
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <form className="d-flex gap-2" onSubmit={handleLogin}>
              <input
                className="form-control form-control-sm"
                style={{ maxWidth: 200 }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario"
              />
              <button className="btn btn-primary btn-sm" type="submit">
                Iniciar sesión
              </button>
            </form>
          )}
          {sessionError && <p className="text-danger small mt-2 mb-0">{sessionError}</p>}
          <p className="text-muted small mt-2 mb-0">
            El contador sigue subiendo aunque atienda otro nodo: la sesión vive en Redis.
          </p>
        </div>
      </section>

      <section className="card mb-3">
        <div className="card-body">
          <h2 className="h5 card-title">Cola offline (IndexedDB)</h2>
          <p className="mb-2">Operaciones pendientes: <strong>{pending}</strong></p>
          <button className="btn btn-outline-secondary btn-sm" onClick={queueDemoOp}>
            Encolar operación
          </button>
          <p className="text-muted small mt-2 mb-0">
            Se encolan en IndexedDB y se sincronizan al volver la conexión.
          </p>
        </div>
      </section>

      <section className="card">
        <div className="card-body">
          <h2 className="h5 card-title">Almacenamiento en el navegador</h2>
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                const n = localCount + 1
                localStorage.setItem('demo-local', n)
                setLocalCount(n)
              }}
            >
              localStorage: {localCount}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                const n = tabCount + 1
                sessionStorage.setItem('demo-tab', n)
                setTabCount(n)
              }}
            >
              sessionStorage: {tabCount}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                const v = `pref-${Date.now() % 1000}`
                document.cookie = `demo_pref=${v}; path=/; max-age=86400; SameSite=Lax`
                setCookieValue(v)
              }}
            >
              cookie: {cookieValue || '—'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
