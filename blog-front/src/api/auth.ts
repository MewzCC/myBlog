import request from '../utils/request'
import type {
  ApiResponse,
  AuthResponse,
  ResetPasswordRequest,
  RegisterRequest,
  User,
  VerificationCodeResult,
  VerificationCodeRequest,
} from '../types/api'

export const login = (data: any) => {
  return request.post<ApiResponse<AuthResponse>>('/auth/login', data)
}

export const logout = () => {
  return request.post<ApiResponse<null>>('/auth/logout')
}

export const getUserInfo = () => {
  return request.get<ApiResponse<User>>('/auth/me')
}

export const updateUserInfo = (data: Partial<User>) => {
  return request.put<ApiResponse<User>>('/auth/me', data)
}

export const sendRegisterCode = (data: VerificationCodeRequest) => {
  return request.post<ApiResponse<VerificationCodeResult>>('/auth/register/code', data)
}

export const register = (data: RegisterRequest) => {
  return request.post<ApiResponse<AuthResponse>>('/auth/register', data)
}

export const sendResetPasswordCode = (data: VerificationCodeRequest) => {
  return request.post<ApiResponse<VerificationCodeResult>>('/auth/password/code', data)
}

export const resetPassword = (data: ResetPasswordRequest) => {
  return request.post<ApiResponse<null>>('/auth/password/reset', data)
}
