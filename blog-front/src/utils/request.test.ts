import { AxiosError } from 'axios'
import { expect, it, vi, afterEach } from 'vitest'
import request from './request'
import { message } from '../components/Message/MessageProvider'
afterEach(() => vi.restoreAllMocks())
it.each([true, false])(
  'keeps failed requests rejectable while optional background reads use silentError=%s',
  async (silentError) => {
    const notify = vi.spyOn(message, 'error')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(
      request.get('/optional-content', {
        silentError,
        adapter: async (config) => {
          throw new AxiosError('Offline', 'ERR_NETWORK', config)
        },
      }),
    ).rejects.toThrow('Offline')
    if (silentError) expect(notify).not.toHaveBeenCalled()
    else expect(notify).toHaveBeenCalledWith('Offline')
  },
)
