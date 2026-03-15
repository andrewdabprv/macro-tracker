import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Today from './pages/Today'
import Foods from './pages/Foods'
import Settings from './pages/Settings'
import MealEditor from './pages/MealEditor'
import './App.css'

export default function App() {
  const location = useLocation()
  const hideTabBar = location.pathname.startsWith('/meals/')

  return (
    <div className="app">
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/today" element={<Today />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/meals/:id" element={<MealEditor />} />
        </Routes>
      </main>

      {!hideTabBar && (
        <nav className="tab-bar">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            Home
          </NavLink>
          <NavLink to="/today" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            Today
          </NavLink>
          <NavLink to="/foods" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            Foods
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'tab active' : 'tab'}>
            Settings
          </NavLink>
        </nav>
      )}
    </div>
  )
}
