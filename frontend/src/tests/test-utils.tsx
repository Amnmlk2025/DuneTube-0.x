import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'
import { PreferencesProvider } from '../context/PreferencesContext'

type UI = React.ReactElement

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </I18nextProvider>
    </MemoryRouter>
  )
}

export function render(ui: UI, options?: Omit<RenderOptions, 'queries'>) {
  return rtlRender(ui, { wrapper: Providers, ...options })
}

// re-export everything
export * from '@testing-library/react'
