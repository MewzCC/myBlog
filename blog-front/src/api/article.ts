import request from '../utils/request'
import type {
  ApiResponse,
  ArticleListResponse,
  ArticleDetail,
  Comment,
  CommentCreateRequest,
  CreateArticleRequest,
} from '../types/api'

export const getArticles = (params: { 
  page?: number; 
  pageSize?: number; 
  keyword?: string;
  category?: string;
  tag?: string;
}) => {
  return request.get<ApiResponse<ArticleListResponse>>('/articles', { params })
}

export const getArticleDetail = (id: string) => {
  return request.get<ApiResponse<ArticleDetail>>(`/articles/${id}`)
}

export const createArticle = (data: CreateArticleRequest) => {
  return request.post<ApiResponse<ArticleDetail>>('/articles', data)
}

export const likeArticle = (id: string) => {
  return request.post<ApiResponse<{ likes: number; isLiked: boolean }>>(`/articles/${id}/like`)
}

export const favoriteArticle = (id: string) => {
  return request.post<ApiResponse<{ favorites: number; isFavorited: boolean }>>(`/articles/${id}/favorite`)
}

export const getArticleComments = (id: string) => {
  return request.get<ApiResponse<Comment[]>>(`/articles/${id}/comments`)
}

export const createArticleComment = (id: string, data: CommentCreateRequest) => {
  return request.post<ApiResponse<Comment>>(`/articles/${id}/comments`, data)
}
