import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import './message.css'

export type MessageKind = 'info' | 'success' | 'warning' | 'error'

export type MessageOptions = {
  durationMs?: number
}

type MessageItem = {
  id: string
  kind: MessageKind
  text: string
  expiresAt: number
}

type PushFn = (kind: MessageKind, text: string, options?: MessageOptions) => string
type CloseFn = (id: string) => void
type ClearFn = () => void

const MessageContext = createContext<{ push: PushFn; close: CloseFn; clear: ClearFn } | null>(null)

let pushImpl: PushFn | null = null
let closeImpl: CloseFn | null = null
let clearImpl: ClearFn | null = null

export const message = {
  info(text: string, options?: MessageOptions) {
    return pushImpl?.('info', text, options) ?? ''
  },
  success(text: string, options?: MessageOptions) {
    return pushImpl?.('success', text, options) ?? ''
  },
  warning(text: string, options?: MessageOptions) {
    return pushImpl?.('warning', text, options) ?? ''
  },
  error(text: string, options?: MessageOptions) {
    return pushImpl?.('error', text, options) ?? ''
  },
  close(id: string) {
    closeImpl?.(id)
  },
  clear() {
    clearImpl?.()
  },
}

const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`

export default function MessageProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MessageItem[]>([])
  const rafRef = useRef<number | null>(null)

  const close = useCallback((id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const push = useCallback<PushFn>((kind, text, options) => {
    const id = makeId()
    const durationMs = options?.durationMs ?? 2600
    const expiresAt = Date.now() + durationMs

    setItems((prev) => {
      const next = [{ id, kind, text, expiresAt }, ...prev]
      return next.slice(0, 4)
    })

    return id
  }, [])

  useEffect(() => {
    pushImpl = push
    closeImpl = close
    clearImpl = clear

    return () => {
      if (pushImpl === push) pushImpl = null
      if (closeImpl === close) closeImpl = null
      if (clearImpl === clear) clearImpl = null
    }
  }, [push, close, clear])

  useEffect(() => {
    if (items.length === 0) return
    const tick = () => {
      setItems((prev) => {
        const now = Date.now()
        const next = prev.filter((x) => x.expiresAt > now)
        return next
      })
      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [items.length])

  const value = useMemo(() => ({ push, close, clear }), [push, close, clear])

  return (
    <MessageContext.Provider value={value}>
      {children}
      <div className="messageHost" aria-live="polite" aria-relevant="additions">
        {items.map((x) => (
          <div
            key={x.id}
            className={`messageToast messageToast${x.kind[0].toUpperCase()}${x.kind.slice(1)} ${
              x.kind === 'info'
                ? 'messageToastInfo'
                : x.kind === 'success'
                  ? 'messageToastSuccess'
                  : x.kind === 'warning'
                    ? 'messageToastWarning'
                    : 'messageToastError'
            }`}
            role={x.kind === 'error' ? 'alert' : 'status'}
          >
            <div className="messageRow">
              <div className="messageBar" aria-hidden="true" />
              <div className="messageText">{x.text}</div>
              <button className="messageClose" type="button" onClick={() => close(x.id)} aria-label="关闭提示">
                <span className="messageCloseIcon" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </MessageContext.Provider>
  )
}

