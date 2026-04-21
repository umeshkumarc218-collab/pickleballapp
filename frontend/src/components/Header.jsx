import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { Menu, X, ChevronDown, User } from 'lucide-react'

export default function Header() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Find Sessions' },
    { to: '/community', label: 'Community' },
    ...(user ? [{ to: '/bookings', label: 'My Bookings' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="bg-court-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center">
              <span className="text-court-800 font-heading font-black text-sm">PB</span>
            </div>
            <span className="font-heading font-black text-xl tracking-wide">
              PICKLE<span className="text-lime-500">BALL</span>
              <span className="text-lime-400 ml-1 text-base font-bold">CANADA</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-body text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-lime-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-7 h-7 bg-lime-500 rounded-full flex items-center justify-center">
                    <User size={14} className="text-court-800" />
                  </div>
                  <span className="text-sm text-gray-200 font-body">
                    {profile?.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-body"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-gray-300 border-gray-600">
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1 pb-4">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg font-body text-sm font-medium ${
                    isActive ? 'bg-white/10 text-lime-400' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-white/10 flex gap-2 px-4">
              {user ? (
                <button onClick={handleSignOut} className="btn-ghost flex-1 text-center">
                  Sign out
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost flex-1 text-center" onClick={() => setMobileOpen(false)}>
                    Log in
                  </Link>
                  <Link to="/signup" className="btn-primary flex-1 text-center" onClick={() => setMobileOpen(false)}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
