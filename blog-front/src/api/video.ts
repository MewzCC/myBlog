import request from '../utils/request'
import type {
  ApiResponse,
  VideoUploadResponse,
  VideoDanmakuItem,
  VideoEventPayload,
  VideoAnalyticsItem,
} from '../types/api'

export const uploadVideo = (file: File, options?: { onProgress?: (percent: number) => void }) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('filename', file.name)

  return request.post<ApiResponse<VideoUploadResponse>>('/upload/video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (evt) => {
      if (!evt.total) return
      const percent = Math.round((evt.loaded / evt.total) * 100)
      options?.onProgress?.(percent)
    },
  })
}

export const getVideoDanmaku = (videoKey: string) => {
  return request.get<ApiResponse<VideoDanmakuItem[]>>(`/videos/${encodeURIComponent(videoKey)}/danmaku`)
}

export const postVideoDanmaku = (videoKey: string, payload: VideoDanmakuItem) => {
  return request.post<ApiResponse<VideoDanmakuItem>>(`/videos/${encodeURIComponent(videoKey)}/danmaku`, payload)
}

export const postVideoEvent = (videoKey: string, payload: VideoEventPayload) => {
  return request.post<ApiResponse<null>>(`/videos/${encodeURIComponent(videoKey)}/events`, payload)
}

export const getVideoAnalytics = () => {
  return request.get<ApiResponse<VideoAnalyticsItem[]>>('/analytics/videos')
}
