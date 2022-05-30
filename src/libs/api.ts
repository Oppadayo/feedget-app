import axios from 'axios'

export const api = axios.create({
  baseURL: "https://feedget-server-production-3186.up.railway.app"
})