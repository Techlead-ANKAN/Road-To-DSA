import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { AppLayout } from './layout/AppLayout.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import CoursePage from './pages/Course.jsx'
import ProfilePage from './pages/Profile.jsx'
import InterviewPrepPage from './pages/InterviewPrep.jsx'
import AdminInterviewQuestionsPage from './pages/AdminInterviewQuestions.jsx'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/course" element={<CoursePage />} />
                <Route path="/interview-prep" element={<InterviewPrepPage />} />
                <Route path="/admin/interview-questions" element={<AdminInterviewQuestionsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
          <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
