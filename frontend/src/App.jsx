import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Callback from './pages/Callback'
import Dashboard from './pages/Dashboard'
import OrgDashboard from './pages/OrgDashboard'
import LoginOrgModal from './components/LoginOrgModal'
import { OrgSessionProvider } from './context/OrgSessionProvider'
function App() {
  return (
    <>
      <Router>
        <OrgSessionProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/org/:orgId" element={<OrgDashboard />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <LoginOrgModal />
        </OrgSessionProvider>
      </Router>
    </>
  )
}

export default App
