import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './lib/i18n.jsx'
import AppShell from './layout/AppShell.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import MotorControl from './pages/MotorControl.jsx'
import MandiPrices from './pages/MandiPrices.jsx'
import Weather from './pages/Weather.jsx'
import Calendar from './pages/Calendar.jsx'
import CropDoctor from './pages/CropDoctor.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Community from './pages/Community.jsx'
import More from './pages/More.jsx'
import Schemes from './pages/Schemes.jsx'
import Equipment from './pages/Equipment.jsx'
import Loans from './pages/Loans.jsx'
import SoilHealth from './pages/SoilHealth.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<AppShell />}>
            <Route path="/home" element={<Home />} />
            <Route path="/motor" element={<MotorControl />} />
            <Route path="/mandi" element={<MandiPrices />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/crop-doctor" element={<CropDoctor />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/community" element={<Community />} />
            <Route path="/more" element={<More />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/soil-health" element={<SoilHealth />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
