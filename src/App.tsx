/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

import { HomePage } from './pages/HomePage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { SignInPage } from './pages/auth/SignInPage';

import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ToolsListPage } from './pages/tools/ToolsListPage';
import { UserAgentGeneratorPage } from './pages/tools/UserAgentGeneratorPage';
import { LeadGeneratorPage } from './pages/tools/LeadGeneratorPage';
import { TextShufflerPage } from './pages/tools/TextShufflerPage';
import { DuplicateTextRemoverPage } from './pages/tools/DuplicateTextRemoverPage';
import { NumberGeneratorPage } from './pages/tools/NumberGeneratorPage';
import { MailGeneratorPage } from './pages/tools/MailGeneratorPage';

import { ResourcesHubPage } from './pages/resources/ResourcesHubPage';
import { CpaNetworksPage } from './pages/resources/CpaNetworksPage';
import { ProxySitesPage } from './pages/resources/ProxySitesPage';
import { AntidetectBrowsersPage } from './pages/resources/AntidetectBrowsersPage';

import { HistoryPage } from './pages/user/HistoryPage';
import { SavedResultsPage } from './pages/user/SavedResultsPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { PaymentPage } from './pages/user/PaymentPage';
import { SupportPage } from './pages/user/SupportPage';

import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminToolsPage } from './pages/admin/AdminToolsPage';
import { AdminDatabasePage } from './pages/admin/AdminDatabasePage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminSupportPage } from './pages/admin/AdminSupportPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const AppRoutes: React.FC = () => {
  const { path } = useRouter();

  // Root Homepage
  if (path === '/') {
    return <HomePage />;
  }

  // Authentication Routes
  if (path === '/signup') {
    return <SignUpPage />;
  }
  if (path === '/signin') {
    return <SignInPage />;
  }

  // Admin Routes (Rendered inside AdminLayout)
  if (path.startsWith('/admin')) {
    let adminContent = <AdminOverviewPage />;
    if (path === '/admin/users') adminContent = <AdminUsersPage />;
    else if (path === '/admin/tools') adminContent = <AdminToolsPage />;
    else if (path === '/admin/database') adminContent = <AdminDatabasePage />;
    else if (path === '/admin/payments') adminContent = <AdminPaymentsPage />;
    else if (path === '/admin/support') adminContent = <AdminSupportPage />;
    else if (path === '/admin/settings') adminContent = <AdminSettingsPage />;

    return <AdminLayout>{adminContent}</AdminLayout>;
  }

  // User Platform & Tools Routes (Rendered inside DashboardLayout)
  let dashboardContent = <DashboardPage />;

  if (path === '/tools') dashboardContent = <ToolsListPage />;
  else if (path === '/tools/user-agent-generator') dashboardContent = <UserAgentGeneratorPage />;
  else if (path === '/tools/lead-generator') dashboardContent = <LeadGeneratorPage />;
  else if (path === '/tools/text-shuffler') dashboardContent = <TextShufflerPage />;
  else if (path === '/tools/duplicate-text-remover') dashboardContent = <DuplicateTextRemoverPage />;
  else if (path === '/tools/number-generator') dashboardContent = <NumberGeneratorPage />;
  else if (path === '/tools/mail-generator') dashboardContent = <MailGeneratorPage />;
  else if (path === '/resources') dashboardContent = <ResourcesHubPage />;
  else if (path === '/resources/cpa-networks') dashboardContent = <CpaNetworksPage />;
  else if (path === '/resources/proxy-sites') dashboardContent = <ProxySitesPage />;
  else if (path === '/resources/antidetect-browsers') dashboardContent = <AntidetectBrowsersPage />;
  else if (path === '/history') dashboardContent = <HistoryPage />;
  else if (path === '/saved-results') dashboardContent = <SavedResultsPage />;
  else if (path === '/profile') dashboardContent = <ProfilePage />;
  else if (path === '/payment') dashboardContent = <PaymentPage />;
  else if (path === '/support') dashboardContent = <SupportPage />;

  return <DashboardLayout>{dashboardContent}</DashboardLayout>;
};

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}
