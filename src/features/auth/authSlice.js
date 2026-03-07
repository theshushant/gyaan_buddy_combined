import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return true
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const changeUserPassword = createAsyncThunk(
  'auth/changeUserPassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  loading: {
    login: false,
    logout: false,
    fetchUser: false,
    updateProfile: false,
    changePassword: false
  },
  error: {
    login: null,
    logout: null,
    fetchUser: null,
    updateProfile: null,
    changePassword: null
  },
  permissions: [],
  lastLogin: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading.login = true
      state.error.login = null
    },
    loginSuccess: (state, action) => {
      state.loading.login = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.role = action.payload.role
      state.permissions = action.payload.permissions || []
      state.lastLogin = new Date().toISOString()
      state.error.login = null
    },
    loginFailure: (state, action) => {
      state.loading.login = false
      state.isAuthenticated = false
      state.user = null
      state.role = null
      state.permissions = []
      state.error.login = action.payload
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.role = null
      state.permissions = []
      state.lastLogin = null
      state.error = {
        login: null,
        logout: null,
        fetchUser: null,
        updateProfile: null,
        changePassword: null
      }
    },
    switchRole: (state, action) => {
      state.role = action.payload
    },
    clearError: (state, action) => {
      const errorType = action.payload || 'all'
      if (errorType === 'all') {
        Object.keys(state.error).forEach(key => {
          state.error[key] = null
        })
      } else if (state.error[errorType] !== undefined) {
        state.error[errorType] = null
      }
    },
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading.login = true
        state.error.login = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading.login = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.role = action.payload.user.role || action.payload.user.user_type
        state.permissions = action.payload.user.permissions || []
        state.lastLogin = new Date().toISOString()
        state.error.login = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading.login = false
        state.isAuthenticated = false
        state.user = null
        state.role = null
        state.permissions = []
        state.error.login = action.payload
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading.logout = true
        state.error.logout = null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading.logout = false
        state.isAuthenticated = false
        state.user = null
        state.role = null
        state.permissions = []
        state.lastLogin = null
        state.error.logout = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading.logout = false
        state.error.logout = action.payload
        state.isAuthenticated = false
        state.user = null
        state.role = null
        state.permissions = []
        state.lastLogin = null
      })

      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading.fetchUser = true
        state.error.fetchUser = null
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading.fetchUser = false
        state.user = action.payload
        state.role = action.payload.role || action.payload.user_type
        state.permissions = action.payload.permissions || []
        state.isAuthenticated = true
        state.error.fetchUser = null
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading.fetchUser = false
        state.error.fetchUser = action.payload
        
        const isTimeoutError = action.payload && (
          action.payload.includes('timeout') || 
          action.payload.includes('Cannot connect to server') ||
          action.payload.includes('Failed to fetch')
        )
        
        if (!isTimeoutError) {
          state.isAuthenticated = false
          state.user = null
          state.role = null
          state.permissions = []
        }
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading.updateProfile = true
        state.error.updateProfile = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading.updateProfile = false
        state.user = { ...state.user, ...action.payload }
        state.error.updateProfile = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading.updateProfile = false
        state.error.updateProfile = action.payload
      })

      .addCase(changeUserPassword.pending, (state) => {
        state.loading.changePassword = true
        state.error.changePassword = null
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading.changePassword = false
        state.error.changePassword = null
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading.changePassword = false
        state.error.changePassword = action.payload
      })
  }
})

export const login = loginUser

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  switchRole, 
  clearError,
  updateUserData,
  setPermissions
} = authSlice.actions

export default authSlice.reducer
