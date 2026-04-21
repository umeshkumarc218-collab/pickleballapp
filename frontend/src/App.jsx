import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Header from './components/Header'
import Home from './pages/Home'
import Community from './pages/Community'
import Bookings from './pages/Bookings'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { RequireAuth, RequireAdmin } from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/community" element={<Community />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/bookings"
                element={
                  <RequireAuth>
                    <Bookings />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <Admin />
                  </RequireAdmin>
                }
              />
            </Routes>
          </div>
          <footer className="bg-court-800 text-gray-400 text-center text-xs font-body py-4 mt-8">
            © 2025 PickleBall Canada · Find sessions · Book spots · Play more
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
