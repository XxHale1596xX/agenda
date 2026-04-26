import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StudentAuthProvider } from './context/StudentAuthContext'
import { ToastProvider } from './components/ui/Toast'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { PortalLayout } from './pages/portal/PortalLayout'
import { PortalDashboard } from './pages/portal/PortalDashboard'
import { PortalAulas } from './pages/portal/PortalAulas'
import { PortalPerfil } from './pages/portal/PortalPerfil'
import AdminApp from './App'
import './index.css'

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <StudentAuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Público */}
              <Route path="/"        element={<LandingPage />} />
              <Route path="/entrar"  element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />

              {/* Portal do aluno */}
              <Route path="/portal" element={<PortalLayout />}>
                <Route index         element={<PortalDashboard />} />
                <Route path="aulas"  element={<PortalAulas />} />
                <Route path="perfil" element={<PortalPerfil />} />
              </Route>

              {/* Admin (app original) */}
              <Route path="/admin/*" element={<AdminApp />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </StudentAuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
