import React from 'react'
import { describe, it, expect } from 'vitest'
import App from '../App'
import { render } from './test-utils'

describe('routing', () => {
  it('renders landing page without crash', () => {
    const ui = render(<App />)
    expect(ui.container.innerHTML.length).toBeGreaterThan(0)
  })
})
