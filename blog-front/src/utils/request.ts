import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { message } from '../components/Message/MessageProvider'
import { getVisitorId } from './visitor'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

import { useUserStore } from '../stores/userStore'

service.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.headers) {
      config.headers['X-Visitor-Id'] = getVisitorId()
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    // Assuming backend returns data directly or wrapped in { code, data, message }
    // Adjust based on actual backend
    return response
  },
  (error) => {
    console.error('Request error:', error)
    message.error(error.response?.data?.message || error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default service
