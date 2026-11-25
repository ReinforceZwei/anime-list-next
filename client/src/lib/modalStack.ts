/**
 * Imperative modal stack singleton, context, and types.
 *
 * Kept separate from ModalStackProvider.tsx so react-refresh/only-export-components
 * is satisfied while preserving `@/lib/modalStack` imports across call sites.
 */

import { createContext, useContext, type ReactNode } from 'react'

// ── Modal registry ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = React.ComponentType<any>
export type ModalRegistry = Record<string, AnyComponent>

// ── Shared modal presentation props ──────────────────────────────────────────

export type SharedModalProps = {
  size?: string | number
  padding?: string | number
  withCloseButton?: boolean
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  // allow unknown presentation overrides without breaking callers
  [key: string]: unknown
}

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
  /** Modal title. Pass to <Modal title={title}> or render inside <Modal.Title>. */
  title?: ReactNode
  /**
   * Combined modal props (opened, onClose, size, etc).
   * Spread onto <Modal> for simple usage, or cherry-pick for compound <Modal.Root>.
   */
  modalProps: {
    opened: boolean
    onClose: () => void
    keepMounted: true
    transitionProps?: { duration: number }
    size?: string | number
    padding?: string | number
    withCloseButton?: boolean
    closeOnClickOutside?: boolean
    closeOnEscape?: boolean
    [key: string]: unknown
  }
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

export function setModalStackApi(api: ModalStackApi | null): void {
  _api = api
}

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

export const ModalStackContext = createContext<ModalStackApi | null>(null)

export function useModalStack(): ModalStackApi {
  const ctx = useContext(ModalStackContext)
  if (!ctx)
    throw new Error('useModalStack must be used within ModalStackProvider')
  return ctx
}
