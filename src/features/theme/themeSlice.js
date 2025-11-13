import { createSlice } from '@reduxjs/toolkit'

// Simple theme slice - always light mode (dark mode removed)
const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: 'light'
  },
  reducers: {
    // No reducers needed - always light mode
  }
})

export default themeSlice.reducer