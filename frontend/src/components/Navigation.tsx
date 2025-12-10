import React from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../store/slices/authSlice';
import './Navigation.css';

interface NavigationProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
  user: User | null;
}

function Navigation({ onToggleSidebar, onLogout, user }: NavigationProps) {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" fill="#007AFF" rx="8"/>
            <circle cx="32" cy="22" r="11" fill="#FF6B6B"/>
            <circle cx="27" cy="19" r="2.5" fill="#FFFFFF"/>
            <circle cx="27" cy="19" r="1.2" fill="#000000"/>
            <circle cx="37" cy="19" r="2.5" fill="#FFFFFF"/>
            <circle cx="37" cy="19" r="1.2" fill="#000000"/>
            <path d="M 26 26 Q 32 28 38 26" stroke="#000000" strokeWidth="1" fill="none" strokeLinecap="round"/>
            <ellipse cx="32" cy="38" rx="11" ry="13" fill="#FF6B6B"/>
            <ellipse cx="32" cy="40" rx="6" ry="8" fill="#FFB3BA" opacity="0.8"/>
          </svg>
          <span className="navbar-brand">QuickSell</span>
        </Link>

        {/* Toggle Sidebar Button */}
        <button className="navbar-toggle" onClick={onToggleSidebar} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Right Side Items */}
        <div className="navbar-right">
          {user ? (
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
              >
                <img
                  src={user.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.firstName} ${user.lastName}`}
                  alt={user.username}
                  className="user-avatar"
                />
                <span className="user-name">{user.firstName || user.username}</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/settings" className="dropdown-item">
                    ⚙️ Settings
                  </Link>
                  <Link to="/gamification" className="dropdown-item">
                    🏆 Achievements
                  </Link>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={onLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/auth/login" className="btn-link">
                Login
              </Link>
              <Link to="/auth/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navigation;
