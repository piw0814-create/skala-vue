export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY?.trim() ?? ''

export const KMA_API_BASE_URL = (import.meta.env.VITE_KMA_API_BASE_URL?.trim() || '/kma-api').replace(/\/+$/, '')
