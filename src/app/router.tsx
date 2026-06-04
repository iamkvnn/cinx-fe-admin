import { createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { CoursesPage } from '@/features/courses/pages/CoursesPage'
import { CourseDetailPage } from '@/features/courses/pages/CourseDetailPage'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { UserDetailPage } from '@/features/users/pages/UserDetailPage'
import { ProfilePage } from '@/features/users/pages/ProfilePage'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
import { InstructorsPage } from '@/features/instructors/pages/InstructorsPage'
import { InstructorDetailPage } from '@/features/instructors/pages/InstructorDetailPage'
import { CouponsPage } from '@/features/vouchers/pages/CouponsPage'
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'

export const router = createBrowserRouter([
  // ─── Public routes ────────────────────────────────────────────────────────
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },

  // ─── Protected routes (require auth) ─────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'courses', element: <CoursesPage /> },
          { path: 'courses/:id', element: <CourseDetailPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'users/:id', element: <UserDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'instructors', element: <InstructorsPage /> },
          { path: 'instructors/:id', element: <InstructorDetailPage /> },
          { path: 'coupons', element: <CouponsPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
          { path: 'reports', element: <ReportsPage /> },
        ],
      },
    ],
  },
])
