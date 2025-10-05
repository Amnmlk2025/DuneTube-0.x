import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('App smoke', () => {
  it('renders', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(document.body.innerHTML.length).toBeGreaterThan(0)
  })
})
