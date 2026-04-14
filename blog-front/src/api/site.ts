import request from '../utils/request'
import type { AdminArticleReviewItem, ApiResponse, SiteSettings } from '../types/api'

export const getSiteSettings = () => {
  return request.get<ApiResponse<SiteSettings>>('/site/settings')
}

export const getAdminSiteSettings = () => {
  return request.get<ApiResponse<SiteSettings>>('/admin/settings')
}

export const updateAdminSiteSettings = (data: SiteSettings) => {
  return request.put<ApiResponse<SiteSettings>>('/admin/settings', data)
}

export const getAdminArticles = (keyword?: string) => {
  return request.get<ApiResponse<AdminArticleReviewItem[]>>('/admin/articles', {
    params: keyword ? { keyword } : undefined,
  })
}

export const approveAdminArticle = (id: string) => {
  return request.post<ApiResponse<null>>(`/admin/articles/${id}/approve`)
}

export const rejectAdminArticle = (id: string) => {
  return request.post<ApiResponse<null>>(`/admin/articles/${id}/reject`)
}
