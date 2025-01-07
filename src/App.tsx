import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/admin/UsersPage';
import { FeaturesPage } from './pages/admin/FeaturesPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { LandingPage } from './pages/LandingPage';
import { TermsPage } from './pages/TermsPage';
import { WarehousesPage } from './pages/warehouses/WarehousesPage';
import { WarehouseDashboardPage } from './pages/warehouses/WarehouseDashboardPage';
import { WarehouseCreatePage } from './pages/warehouses/WarehouseCreatePage';
import { WarehouseEditPage } from './pages/warehouses/WarehouseEditPage';
import { WarehouseDetailsPage } from './pages/warehouses/WarehouseDetailsPage';
import { InquiriesPage } from './pages/inquiries/InquiriesPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { Layout } from './components/layout/Layout';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <ErrorBoundary>
      <Layout className={isLandingPage ? 'bg-white' : 'bg-gray-50'}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/features" element={<FeaturesPage />} />
        <Route path="/warehouses" element={<WarehousesPage />} />
        <Route path="/warehouses/dashboard" element={<WarehouseDashboardPage />} />
        <Route path="/warehouses/create" element={<WarehouseCreatePage />} />
        <Route path="/warehouses/edit/:id" element={<WarehouseEditPage />} />
        <Route path="/warehouses/:id" element={<WarehouseDetailsPage />} />
        <Route path="/inquiries" element={<InquiriesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/" element={<LandingPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
