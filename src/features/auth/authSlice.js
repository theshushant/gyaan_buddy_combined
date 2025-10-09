import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  role: 'principal', // 'principal' or 'teacher'
  isAuthenticated: false,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.role = action.payload.role
      state.error = null
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.role = null
      state.error = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.role = null
      state.error = null
    },
    switchRole: (state, action) => {
      state.role = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  }
})

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  switchRole, 
  clearError 
} = authSlice.actions

export default authSlice.reducer
