import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MessageProvider, { message } from './MessageProvider'

describe('MessageProvider', () => {
  it('exposes message api when mounted', () => {
    render(
      <MessageProvider>
        <div />
      </MessageProvider>
    )

    const id = message.success('ok')
    expect(typeof id).toBe('string')
  })
})

