import axios from 'axios';
// import { APIRoute } from 'enums/api'

const instance = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

// const getStoredAuthToken = (): string | null => localStorage.getItem('authToken')
// const storeAuthToken = (token: string): void => localStorage.setItem('authToken', token)
// const clearStoredAuthToken = (): void => localStorage.removeItem('authToken')

// const setAuthorizationHeader = (headers: AxiosRequestHeaders | undefined, token: string): AxiosRequestHeaders => {
//   const nextHeaders = (headers || {}) as AxiosRequestHeaders
//   nextHeaders.Authorization = `Bearer ${token}`
//   return nextHeaders
// }

// const isSignTokenRequest = (url: string | undefined): boolean => {
//   if (!url) return false
//   return url.includes(APIRoute.SIGN_TOKEN)
// }

// Request interceptor for auth
// instance.interceptors.request.use((config) => {
//   const token = getStoredAuthToken()
//   if (token) {
//     config.headers = setAuthorizationHeader(config.headers as AxiosRequestHeaders, token)
//   }

//   return config
// })

// Minimal 401 refresh token logic
// const refreshClient = axios.create({ baseURL: process.env.REACT_APP_BACKEND_URL })

// const requestNewToken = async (): Promise<string> => {
//   const clientId = process.env.REACT_APP_CLIENT_ID
//   if (!clientId) throw new Error('Missing REACT_APP_CLIENT_ID')

//   const { data } = await refreshClient.post(APIRoute.SIGN_TOKEN, {
//     client_id: clientId,
//     expires: '1d',
//   })

//   const token: string | undefined = data?.data?.token || data?.token
//   if (!token) throw new Error('Token not found in sign-token response')
//   return token
// }

// Response interceptor for error handling
// instance.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const status = error.response?.status
//     const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined

//     // Only handle 401s with retry
//     if (status !== 401 || !originalRequest) return Promise.reject(error)

//     if (originalRequest._retry || isSignTokenRequest(originalRequest.url)) {
//       return Promise.reject(error)
//     }

//     originalRequest._retry = true

// try {
//   const newToken = await requestNewToken()
//   storeAuthToken(newToken)
//   originalRequest.headers = setAuthorizationHeader(originalRequest.headers as AxiosRequestHeaders, newToken)
//   return instance(originalRequest)
// } catch {
//   clearStoredAuthToken()
//   return Promise.reject(error)
// }
//   },
// )

export default instance;
