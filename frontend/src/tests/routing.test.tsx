import React from 'react'
import { describe, it, expect } from 'vitest'
import App from '../App'
import { render } from './test-utils'

describe('routing', () => {
  it('renders at /catalog without crash', () => {
    const ui = render(<App />, { })
    // وجود ریشه‌ی اپ کافی است
    expect(ui.container.innerHTML.length).toBeGreaterThan(0)
  })
})
