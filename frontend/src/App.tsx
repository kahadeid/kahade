import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { getAppMode } from "./config/app.config";
import { lazy, Suspense } from "react";
import { Spinner } from "@phosphor-icons/react";

/**
 * PERFORMANCE FIX [FE-PERF-003]: Lazy Loading Implementation
 * 
 * All pages are now loaded lazily using React.lazy() and Suspense.
 * This significantly reduces the initial bundle size and improves:
 * - First Contentful Paint (FCP)
 * - Time to Interactive (TTI)
 * - Largest Contentful Paint (LCP)
 * 
 * Pages are only loaded when user navigates to them.
 */

// Import ProtectedRoute component
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Loading Fallback Component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Spinner 
          className="w-8 h-8 animate-spin text-primary mx-auto" 
          weight="bold" 
          aria-hidden="true" 
        />
        <p className="text-sm text-muted-foreground">Memuat halaman...</p>
      </div>
    </div>
  );
}

// === LAZY LOADED PAGES ===

// Common Pages
const NotFound = lazy(() => import("@/pages/NotFound"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));

// Landing Pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Security = lazy(() => import("./pages/Security"));
const UseCases = lazy(() => import("./pages/UseCases"));
const Partners = lazy(() => import("./pages/Partners"));
const Compare = lazy(() => import("./pages/Compare"));

// Product Pages
const MobileApp = lazy(() => import("./pages/MobileApp"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));

// Support Pages
const Help = lazy(() => import("./pages/Help"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Feedback = lazy(() => import("./pages/Feedback"));

// Company Pages
const Careers = lazy(() => import("./pages/Careers"));
const Whitepaper = lazy(() => import("./pages/Whitepaper"));
const Docs = lazy(() => import("./pages/Docs"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const IntegrationDocs = lazy(() => import("./pages/IntegrationDocs"));
const Press = lazy(() => import("./pages/Press"));

// Legal Pages
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Licenses = lazy(() => import("./pages/Licenses"));

// Auth Pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const OAuthCallback = lazy(() => import("./pages/auth/OAuthCallback"));

// User Dashboard Pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Transactions = lazy(() => import("./pages/dashboard/Transactions"));
const TransactionDetail = lazy(() => import("./pages/dashboard/TransactionDetail"));
const CreateTransaction = lazy(() => import("./pages/dashboard/CreateTransaction"));
const AcceptTransactionInvite = lazy(() => import("./pages/dashboard/AcceptTransactionInvite"));
const Wallet = lazy(() => import("./pages/dashboard/Wallet"));
const Notifications = lazy(() => import("./pages/dashboard/Notifications"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const EditProfile = lazy(() => import("./pages/dashboard/EditProfile"));
const RewardPoints = lazy(() => import("./pages/dashboard/RewardPoints"));
const RewardRank = lazy(() => import("./pages/dashboard/RewardRank"));
const RewardMissions = lazy(() => import("./pages/dashboard/RewardMissions"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const BankAccounts = lazy(() => import("./pages/dashboard/BankAccounts"));
const KYCVerification = lazy(() => import("./pages/dashboard/KYCVerification"));
const Referrals = lazy(() => import("./pages/dashboard/Referrals"));
const Disputes = lazy(() => import("./pages/dashboard/Disputes"));
const DisputeDetail = lazy(() => import("./pages/dashboard/DisputeDetail"));
const ActivityLog = lazy(() => import("./pages/dashboard/ActivityLog"));
const Deposit = lazy(() => import("./pages/dashboard/Deposit"));
const Messages = lazy(() => import("./pages/dashboard/messaging/Messages"));
const SupportTickets = lazy(() => import("./pages/dashboard/support/SupportTickets"));
const MFASettings = lazy(() => import("./pages/dashboard/MFASettings"));

// Admin Dashboard Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminTransactions = lazy(() => import("./pages/admin/AdminTransactions"));
const AdminDisputes = lazy(() => import("./pages/admin/AdminDisputes"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminKYC = lazy(() => import("./pages/admin/AdminKYC"));
const AdminWithdrawals = lazy(() => import("./pages/admin/AdminWithdrawals"));
const AdminPromos = lazy(() => import("./pages/admin/AdminPromos"));
const AdminDeposits = lazy(() => import("./pages/admin/AdminDeposits"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));

// Landing Router - for domain.com
function LandingRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Main Pages */}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/how-it-works" component={HowItWorks} />
        <Route path="/contact" component={Contact} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/security" component={Security} />
        <Route path="/use-cases" component={UseCases} />
        <Route path="/partners" component={Partners} />
        <Route path="/compare" component={Compare} />
        
        {/* Product Pages */}
        <Route path="/mobile-app" component={MobileApp} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogDetail} />
        
        {/* Support Pages */}
        <Route path="/help" component={Help} />
        <Route path="/faq" component={FAQ} />
        <Route path="/feedback" component={Feedback} />
        
        {/* Company Pages */}
        <Route path="/careers" component={Careers} />
        <Route path="/whitepaper" component={Whitepaper} />
        <Route path="/docs/api" component={ApiDocs} />
        <Route path="/docs/integration" component={IntegrationDocs} />
        <Route path="/docs" component={Docs} />
        <Route path="/press" component={Press} />
        
        {/* Legal Pages */}
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/licenses" component={Licenses} />
        
        {/* Auth Pages */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/oauth/callback" component={OAuthCallback} />
        
        {/* 404 */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// App Router - for app.domain.com
function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Auth Pages */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/oauth/callback" component={OAuthCallback} />
        
        {/* Protected Routes */}
        <Route path="/">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/transactions">
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        </Route>
        <Route path="/transactions/accept/:token">
          <ProtectedRoute>
            <AcceptTransactionInvite />
          </ProtectedRoute>
        </Route>
        <Route path="/transactions/new">
          <ProtectedRoute>
            <CreateTransaction />
          </ProtectedRoute>
        </Route>
        <Route path="/transactions/:id">
          <ProtectedRoute>
            <TransactionDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/wallet">
          <ProtectedRoute>
            <Wallet />
          </ProtectedRoute>
        </Route>
        <Route path="/deposit">
          <ProtectedRoute>
            <Deposit />
          </ProtectedRoute>
        </Route>
        <Route path="/bank-accounts">
          <ProtectedRoute>
            <BankAccounts />
          </ProtectedRoute>
        </Route>
        <Route path="/kyc">
          <ProtectedRoute>
            <KYCVerification />
          </ProtectedRoute>
        </Route>
        <Route path="/referrals">
          <ProtectedRoute>
            <Referrals />
          </ProtectedRoute>
        </Route>
        <Route path="/disputes">
          <ProtectedRoute>
            <Disputes />
          </ProtectedRoute>
        </Route>
        <Route path="/disputes/:id">
          <ProtectedRoute>
            <DisputeDetail />
          </ProtectedRoute>
        </Route>
        <Route path="/activity">
          <ProtectedRoute>
            <ActivityLog />
          </ProtectedRoute>
        </Route>
        <Route path="/notifications">
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/profile/edit">
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        </Route>
        <Route path="/rewards/points">
          <ProtectedRoute>
            <RewardPoints />
          </ProtectedRoute>
        </Route>
        <Route path="/rewards/rank">
          <ProtectedRoute>
            <RewardRank />
          </ProtectedRoute>
        </Route>
        <Route path="/rewards/missions">
          <ProtectedRoute>
            <RewardMissions />
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        </Route>
        <Route path="/messages">
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        </Route>
        <Route path="/support">
          <ProtectedRoute>
            <SupportTickets />
          </ProtectedRoute>
        </Route>
        <Route path="/security">
          <ProtectedRoute>
            <MFASettings />
          </ProtectedRoute>
        </Route>
        
        {/* Public Routes */}
        <Route path="/help" component={Help} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/licenses" component={Licenses} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// Admin Router - for admin.domain.com
function AdminRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Auth Pages */}
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        
        {/* Admin Protected Routes */}
        <Route path="/">
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/users">
          <ProtectedRoute requireAdmin>
            <AdminUsers />
          </ProtectedRoute>
        </Route>
        <Route path="/transactions">
          <ProtectedRoute requireAdmin>
            <AdminTransactions />
          </ProtectedRoute>
        </Route>
        <Route path="/disputes">
          <ProtectedRoute requireAdmin>
            <AdminDisputes />
          </ProtectedRoute>
        </Route>
        <Route path="/kyc">
          <ProtectedRoute requireAdmin>
            <AdminKYC />
          </ProtectedRoute>
        </Route>
        <Route path="/withdrawals">
          <ProtectedRoute requireAdmin>
            <AdminWithdrawals />
          </ProtectedRoute>
        </Route>
        <Route path="/promos">
          <ProtectedRoute requireAdmin>
            <AdminPromos />
          </ProtectedRoute>
        </Route>
        <Route path="/deposits">
          <ProtectedRoute requireAdmin>
            <AdminDeposits />
          </ProtectedRoute>
        </Route>
        <Route path="/reports">
          <ProtectedRoute requireAdmin>
            <AdminReports />
          </ProtectedRoute>
        </Route>
        <Route path="/audit-logs">
          <ProtectedRoute requireAdmin>
            <AdminAuditLogs />
          </ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute requireAdmin>
            <AdminSettings />
          </ProtectedRoute>
        </Route>
        
        {/* Public Routes */}
        <Route path="/unauthorized" component={Unauthorized} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// Main Router - selects based on app mode
function Router() {
  const appMode = getAppMode();

  switch (appMode) {
    case 'admin':
      return <AdminRouter />;
    case 'app':
      return <AppRouter />;
    case 'landing':
    default:
      return <LandingRouter />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                className: 'glass-card',
              }}
            />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
