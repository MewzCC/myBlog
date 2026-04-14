import request from '../utils/request'
import type { ApiResponse, GuestbookMessage } from '../types/api'

export const getGuestbookMessages = () => {
  return request.get<ApiResponse<GuestbookMessage[]>>('/guestbook/messages')
}

export const postGuestbookMessage = (content: string) => {
  return request.post<ApiResponse<GuestbookMessage>>('/guestbook/messages', { content })
}
