import request from '../utils/request'
import type { ApiResponse, Category, Tag } from '../types/api'

export const getAllCategories = () => {
  return request.get<ApiResponse<Category[]>>('/meta/categories')
}

export const getAllTags = () => {
  return request.get<ApiResponse<Tag[]>>('/meta/tags')
}
