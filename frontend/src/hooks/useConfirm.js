import { useState } from 'react'

export function useConfirm() {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    title: '',
    type: 'warning',
    onConfirm: null,
    onCancel: null
  })

  const confirm = ({ message, title, type = 'warning' }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        title,
        type,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }))
          resolve(false)
        }
      })
    })
  }

  return {
    confirm,
    confirmState,
    closeConfirm: () => setConfirmState(prev => ({ ...prev, isOpen: false }))
  }
}
