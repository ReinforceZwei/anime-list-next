/**
 * Custom modal stack provider that keeps all stacked modals mounted
 * (keepMounted=true), so each modal's component state is preserved when a child
 * modal opens on top.
 */

import {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import { Modal, Button, Group } from '@mantine/core'
import { randomId } from '@mantine/hooks'
import {
  ModalStackContext,
  setModalStackApi,
  type ModalRegistry,
  type ModalStackApi,
  type OpenConfirmModalProps,
  type OpenContextModalProps,
  type OpenModalProps,
  type SharedModalProps,
} from './modalStack'

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

export function ModalStackProvider({
  modals: registry,
  children,
}: {
  modals: ModalRegistry
  children: ReactNode
}) {
  const [stack, setStack] = useState<StackEntry[]>([])

  const openContextModal = useCallback(
    (props: OpenContextModalProps): string => {
      const { modal, title, innerProps, ...sharedProps } = props
      const id = randomId()
      setStack((s) => [
        ...s,
        { kind: 'context', id, modal, title, innerProps, sharedProps },
      ])
      return id
    },
    [],
  )

  const open = useCallback((props: OpenModalProps): string => {
    const { title, children, ...sharedProps } = props
    const id = randomId()
    setStack((s) => [
      ...s,
      { kind: 'content', id, title, children, sharedProps },
    ])
    return id
  }, [])

  const openConfirmModal = useCallback(
    (props: OpenConfirmModalProps): string => {
      const id = randomId()
      setStack((s) => [...s, { kind: 'confirm', id, ...props }])
      return id
    },
    [],
  )

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
    setModalStackApi(api)
    return () => {
      setModalStackApi(null)
    }
  }, [api])

  // Narrow context object passed as `context` prop to context modal components.
  // Modal components only ever call context.closeModal(id) and context.closeAll().
  const modalContext = useMemo(
    () => ({ closeModal, closeAll }),
    [closeModal, closeAll],
  )

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
          if (!Component) {
            console.warn(
              `[modalStack] context modal '${entry.modal}' is opened without a registry`,
            )
            return null
          }
          const modalProps = {
            ...entry.sharedProps,
            ...commonModalProps,
          }
          return (
            <Fragment key={entry.id}>
              <Component
                // Cast: ContextModalProps.context expects full ModalsContextProps,
                // but our components only use closeModal / closeAll at runtime.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                context={modalContext as any}
                id={entry.id}
                innerProps={entry.innerProps}
                title={entry.title}
                modalProps={modalProps}
              />
            </Fragment>
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
            <Modal key={entry.id} title={entry.title} {...commonModalProps}>
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
