import { FC, createContext, useContext, useState, ReactNode } from 'react'
import { noop } from '../../util'

export interface IDialogContext {
  /**
   * Sets the current dialog. Only one dialog can be visible at a time.
   *
   * @param dialog The element to display as a dialog
   */
  readonly setDialog: (dialog?: ReactNode) => void
}

/**
 * Provides context for controlling the current dialog.
 * Only one dialog can be visible at a time.
 */
export const DialogContext = createContext<IDialogContext>({ setDialog: noop })

/**
 * Helper function for using {@link DialogContext}
 */
export const useDialogContext = () => useContext(DialogContext)

export interface DialogContextProviderProps {
  readonly children?: ReactNode
}

export const DialogContextProvider: FC<DialogContextProviderProps> = ({ children }) => {
  const [dialog, setDialog] = useState<ReactNode>()

  return <DialogContext.Provider value={{ setDialog }}>{children}</DialogContext.Provider>
}
