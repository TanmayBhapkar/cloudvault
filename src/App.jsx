import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { FileProvider } from './context/FileContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyFilesPage } from './pages/MyFilesPage';
import { UploadPage } from './pages/UploadPage';
import { SharedWithMePage } from './pages/SharedWithMePage';
import { SharedByMePage } from './pages/SharedByMePage';
import { StoragePage } from './pages/StoragePage';
import { TrashPage } from './pages/TrashPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShareViewPage } from './pages/ShareViewPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FileProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Authentication Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/files" element={<MyFilesPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/shared-with-me" element={<SharedWithMePage />} />
                  <Route path="/shared-by-me" element={<SharedByMePage />} />
                  <Route path="/storage" element={<StoragePage />} />
                  <Route path="/trash" element={<TrashPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Secure Share Link View */}
                <Route path="/share/:shareId" element={<ShareViewPage />} />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </FileProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
