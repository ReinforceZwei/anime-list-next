/**
 * Custom modal stack that keeps all stacked modals mounted (keepMounted=true),
 * so each modal's component state is preserved when a child modal opens on top.
 *
 * Drop-in replacement for Mantine's ModalsProvider + modals singleton.
 * The public API surface matches the subset used in this project:
 *   modals.openContextModal / open / openConfirmModal / closeModal / close / closeAll
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { Modal, Button, Group } from '@mantine/core'
import { randomId } from '@mantine/hooks'

// ── Modal registry ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>
type ModalRegistry = Record<string, AnyComponent>

// ── Shared modal presentation props ──────────────────────────────────────────

type SharedModalProps = {
  size?: string | number
  padding?: string | number
  withCloseButton?: boolean
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  // allow unknown presentation overrides without breaking callers
  [key: string]: unknown
}

// ── Stack entry union ─────────────────────────────────────────────────────────

type ContextEntry = {
  kind: 'context'
  id: string
  modal: string
  title?: ReactNode
  innerProps: Record<string, unknown>
  sharedProps: SharedModalProps
}

type ContentEntry = {
  kind: 'content'
  id: string
  title?: ReactNode
  children?: ReactNode
  sharedProps: SharedModalProps
}

type ConfirmEntry = {
  kind: 'confirm'
  id: string
  title?: ReactNode
  children?: ReactNode
  labels: { confirm: string; cancel: string }
  confirmProps?: Record<string, unknown>
  cancelProps?: Record<string, unknown>
  onConfirm?: () => void
  onCancel?: () => void
}

type StackEntry = ContextEntry | ContentEntry | ConfirmEntry

// ── ContextModalProps ─────────────────────────────────────────────────────────

/**
 * Props injected by ModalStackProvider into every context modal component.
 * Replaces the Mantine-supplied ContextModalProps type so @mantine/modals can
 * be removed as a dependency.
 */
export type ContextModalProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  /** Partial modal context — only the methods used by modal components. */
  context: {
    closeModal: (id: string) => void
    closeAll: () => void
  }
  /** The unique ID assigned to this modal instance. */
  id: string
  /** Caller-supplied inner props. */
  innerProps: T
}

// ── Public API types ──────────────────────────────────────────────────────────

export type OpenContextModalProps = {
  modal: string
  title?: ReactNode
  innerProps: Record<string, unknown>
} & SharedModalProps

export type OpenModalProps = {
  title?: ReactNode
  children?: ReactNode
} & SharedModalProps

export type OpenConfirmModalProps = {
  title?: ReactNode
  children?: ReactNode
  labels: { confirm: string; cancel: string }
  confirmProps?: Record<string, unknown>
  cancelProps?: Record<string, unknown>
  onConfirm?: () => void
  onCancel?: () => void
}

export type ModalStackApi = {
  openContextModal: (props: OpenContextModalProps) => string
  open: (props: OpenModalProps) => string
  openConfirmModal: (props: OpenConfirmModalProps) => string
  closeModal: (id: string) => void
  /** Alias for closeModal — matches the `modals.close(id)` call pattern */
  close: (id: string) => void
  closeAll: () => void
}

// ── Module-level ref — allows the imperative `modals` singleton ───────────────

let _api: ModalStackApi | null = null

/**
 * Imperative singleton. Call sites can use this exactly like Mantine's
 * `import { modals } from '@mantine/modals'`.
 */
export const modals: ModalStackApi = {
  openContextModal: (props) => _api!.openContextModal(props),
  open: (props) => _api!.open(props),
  openConfirmModal: (props) => _api!.openConfirmModal(props),
  closeModal: (id) => _api!.closeModal(id),
  close: (id) => _api!.close(id),
  closeAll: () => _api!.closeAll(),
}

// ── React context ─────────────────────────────────────────────────────────────

const ModalStackContext = createContext<ModalStackApi | null>(null)

export function useModalStack(): ModalStackApi {
  const ctx = useContext(ModalStackContext)
  if (!ctx) throw new Error('useModalStack must be used within ModalStackProvider')
  return ctx
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ModalStackProvider({
  modals: registry,
  children,
}: {
  modals: ModalRegistry
  children: ReactNode
}) {
  const [stack, setStack] = useState<StackEntry[]>([])

  const openContextModal = useCallback((props: OpenContextModalProps): string => {
    const { modal, title, innerProps, ...sharedProps } = props
    const id = randomId()
    setStack((s) => [...s, { kind: 'context', id, modal, title, innerProps, sharedProps }])
    return id
  }, [])

  const open = useCallback((props: OpenModalProps): string => {
    const { title, children, ...sharedProps } = props
    const id = randomId()
    setStack((s) => [...s, { kind: 'content', id, title, children, sharedProps }])
    return id
  }, [])

  const openConfirmModal = useCallback((props: OpenConfirmModalProps): string => {
    const id = randomId()
    setStack((s) => [...s, { kind: 'confirm', id, ...props }])
    return id
  }, [])

  const closeModal = useCallback((id: string) => {
    setStack((s) => s.filter((e) => e.id !== id))
  }, [])

  const closeAll = useCallback(() => {
    setStack([])
  }, [])

  const api = useMemo<ModalStackApi>(
    () => ({
      openContextModal,
      open,
      openConfirmModal,
      closeModal,
      close: closeModal,
      closeAll,
    }),
    [openContextModal, open, openConfirmModal, closeModal, closeAll],
  )

  // Keep module-level singleton in sync so imperative callers work
  useEffect(() => {
    _api = api
    return () => {
      _api = null
    }
  }, [api])

  // Narrow context object passed as `context` prop to context modal components.
  // Modal components only ever call context.closeModal(id) and context.closeAll().
  const modalContext = useMemo(() => ({ closeModal, closeAll }), [closeModal, closeAll])

  return (
    <ModalStackContext.Provider value={api}>
      {children}

      {stack.map((entry, i) => {
        const isTop = i === stack.length - 1
        // Background modals must not animate when covered — instant hide avoids
        // a jarring close transition while a child modal is opening on top.
        const transitionProps = isTop ? undefined : { duration: 0 }
        const commonModalProps = {
          opened: isTop,
          keepMounted: true as const,
          transitionProps,
          onClose: () => closeModal(entry.id),
        }

        if (entry.kind === 'context') {
          const Component = registry[entry.modal]
          if (!Component) return null
          const { sharedProps } = entry
          return (
            <Modal
              key={entry.id}
              title={entry.title}
              {...sharedProps}
              {...commonModalProps}
            >
              <Component
                // Cast: ContextModalProps.context expects full ModalsContextProps,
                // but our components only use closeModal / closeAll at runtime.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                context={modalContext as any}
                id={entry.id}
                innerProps={entry.innerProps}
              />
            </Modal>
          )
        }

        if (entry.kind === 'content') {
          const { sharedProps } = entry
          return (
            <Modal
              key={entry.id}
              title={entry.title}
              {...sharedProps}
              {...commonModalProps}
            >
              {entry.children}
            </Modal>
          )
        }

        if (entry.kind === 'confirm') {
          return (
            <Modal
              key={entry.id}
              title={entry.title}
              {...commonModalProps}
            >
              {entry.children}
              <Group justify="flex-end" mt="md">
                <Button
                  variant="default"
                  {...(entry.cancelProps ?? {})}
                  onClick={() => {
                    entry.onCancel?.()
                    closeModal(entry.id)
                  }}
                >
                  {entry.labels.cancel}
                </Button>
                <Button
                  {...(entry.confirmProps ?? {})}
                  onClick={() => {
                    entry.onConfirm?.()
                    closeModal(entry.id)
                  }}
                >
                  {entry.labels.confirm}
                </Button>
              </Group>
            </Modal>
          )
        }

        return null
      })}
    </ModalStackContext.Provider>
  )
}
