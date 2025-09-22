import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Navbar from './components/layout/Navbar';
import SchemeList from './components/scheme/SchemeList';
import Payment from './components/scheme/Payment';
import SelectedSchemeList from './components/scheme/SelectedSchemeList';
import AddAim from './components/aim/AddAim';
import AimList from './components/aim/AimList';
import GetProfile from './components/profile/GetProfile';
import UpdateProfile from './components/profile/UpdateProfile';
import AddAddress from './components/profile/AddAddress';
import WalletPage from './components/wallet/Wallet';
import ViewSelectedScheme from './components/scheme/ViewSelectedScheme';
import SchemesManager from './pages/Scheme';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [purchasedSchemes, setPurchasedSchemes] = useState([]);
  const [aims, setAims] = useState([]);

  const handleSchemeSelect = (scheme) => {
    setSelectedScheme(scheme);
  };

  const handlePaymentComplete = (scheme) => {
    setPurchasedSchemes([...purchasedSchemes, scheme]);
  };

  const handleAimAdded = (aim) => {
    setAims([...aims, aim]);
  };

  // Show a loading state while checking authentication
  if (isLoading) return <div>Loading...</div>;

  // If no user is authenticated, show login/register routes
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If user is authenticated, show protected routes
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/schemes" element={<SchemesManager />} />
            <Route path="/schemes/payment" element={<Payment scheme={selectedScheme} onPaymentComplete={handlePaymentComplete} />} />
            <Route path="/schemes/selected" element={<SelectedSchemeList selectedSchemes={purchasedSchemes} />} />
            <Route path="/schemes/selected/view" element={<ViewSelectedScheme />} />
            <Route path="/aims" element={<AimList aims={aims} />} />
            <Route path="/aims/add" element={<AddAim onAimAdded={handleAimAdded} />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/profile" element={<GetProfile />} />
            <Route path="/profile/update" element={<UpdateProfile />} />
            <Route path="/profile/address" element={<AddAddress />} />
            <Route path="*" element={<Navigate to="/schemes" replace />} />
          </Routes>
        </div>
      </div>
    </UserProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;