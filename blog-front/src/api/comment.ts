import request from '../utils/request'
import type { ApiResponse, CommentActionResponse } from '../types/api'

export const likeComment = (commentId: string) => {
  return request.post<ApiResponse<CommentActionResponse>>(`/comments/${commentId}/like`)
}

export const deleteComment = (commentId: string) => {
  return request.delete<ApiResponse<null>>(`/comments/${commentId}`)
}

export const reportComment = (commentId: string) => {
  return request.post<ApiResponse<null>>(`/comments/${commentId}/report`)
}
