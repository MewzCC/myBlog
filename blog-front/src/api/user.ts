import request from '../utils/request'
import type { ApiResponse, User } from '../types/api'

export const updateUserInfo = (data: Partial<User>) => {
  return request.put<ApiResponse<User>>('/auth/me', data)
}

export const getBloggerProfile = () => {
  return request.get<ApiResponse<User>>('/blogger/profile')
}
