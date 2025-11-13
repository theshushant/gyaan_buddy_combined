import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import authReducer from '../features/auth/authSlice'
import studentsReducer from '../features/students/studentsSlice'
import teachersReducer from '../features/teachers/teachersSlice'
import questionsReducer from '../features/questions/questionsSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import reportsReducer from '../features/reports/reportsSlice'
import aiReducer from '../features/ai/aiSlice'
import classesReducer from '../features/classes/classesSlice'
import subjectsReducer from '../features/subjects/subjectsSlice'
import themeReducer from '../features/theme/themeSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    students: studentsReducer,
    teachers: teachersReducer,
    questions: questionsReducer,
    dashboard: dashboardReducer,
    reports: reportsReducer,
    ai: aiReducer,
    classes: classesReducer,
    subjects: subjectsReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})
