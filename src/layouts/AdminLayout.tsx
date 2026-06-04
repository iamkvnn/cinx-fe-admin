import { Outlet, NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  Tags,
  Users,
  UserSquare2,
  AlertTriangle,
  Ticket,
  Bell,
  LogOut,
  User,
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { UserService, notificationService } from "@/services"

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Khóa học', href: '/courses', icon: BookOpen },
  { name: 'Danh mục', href: '/categories', icon: Tags },
  { name: 'Người dùng', href: '/users', icon: Users },
  { name: 'Giảng viên', href: '/instructors', icon: UserSquare2 },
  { name: 'Báo cáo', href: '/reports', icon: AlertTriangle },
  { name: 'Mã giảm giá', href: '/coupons', icon: Ticket },
  { name: 'Thông báo', href: '/notifications', icon: Bell },
  { name: 'Cá nhân', href: '/profile', icon: User },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearTokens = useAuthStore((state) => state.clearTokens)

  const handleLogout = () => {
    clearTokens()
    navigate('/login', { replace: true })
  }

  // Fetch current user details
  const { data: currentUserData } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => UserService.getCurrentUser(),
  })
  const currentUser = currentUserData?.data

  // Fetch unread count & recent notifications
  const { data: unreadData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => notificationService.countUnreadNotifications(),
  })
  const unreadCount = unreadData?.data ?? 0

  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["header-notifications"],
    queryFn: () => notificationService.getNotifications({ page: 1, size: 5 }),
  })
  const notifications = notificationsData?.data ?? []

  // Mutations for notifications
  const toggleReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.toggleRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-count"] })
      queryClient.invalidateQueries({ queryKey: ["header-notifications"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const handleNotificationClick = (notificationId: string) => {
    toggleReadMutation.mutate(notificationId)
  }

  const markAllRead = () => {
    notifications.filter(n => !n.isRead).forEach(n => n.id && toggleReadMutation.mutate(n.id))
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <span className="text-xl font-bold text-primary tracking-tight">EduManage</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1.5 px-4">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            {/* Notification Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="relative p-2 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl hover:bg-muted/80 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white scale-90 animate-in zoom-in-50">
                      {unreadCount}
                    </span>
                  )}
                </button>
              } />
              <DropdownMenuContent align="end" className="w-80 p-2 max-h-96 overflow-y-auto border border-border/85 rounded-2xl shadow-xl bg-card">
                <div className="flex justify-between items-center px-3 py-2 text-xs font-bold text-muted-foreground border-b border-border/40 pb-2">
                  <span>Thông báo mới nhận</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-primary hover:underline cursor-pointer font-bold">
                      Đọc tất cả
                    </button>
                  )}
                </div>
                {isLoadingNotifications ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">Đang tải...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">Không có thông báo mới</div>
                ) : (
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        onClick={() => n.id && handleNotificationClick(n.id)}
                        className={cn(
                          "flex flex-col items-start gap-1 p-2.5 rounded-xl text-left cursor-pointer transition-colors border-b border-border/20 last:border-0",
                          !n.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 animate-pulse" />}
                          <span className={cn("text-xs font-semibold truncate", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                            {n.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 pl-3">
                          {n.message}
                        </p>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('/notifications')}
                  className="justify-center text-xs text-primary font-semibold py-2 cursor-pointer text-center w-full"
                >
                  Xem tất cả thông báo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center text-foreground font-semibold text-sm cursor-pointer shadow-sm hover:scale-105 transition-transform duration-200 outline-none">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0).toUpperCase() || "A"
                  )}
                </button>
              } />
              <DropdownMenuContent align="end" className="w-56 p-2 border border-border/85 rounded-2xl shadow-xl bg-card">
                <div className="px-3 py-2 border-b border-border/40 pb-2">
                  <p className="text-sm font-semibold truncate text-foreground">{currentUser?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px] tracking-wider uppercase">
                    {currentUser?.role || 'ADMIN'}
                  </span>
                </div>
                <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2.5 mt-1 cursor-pointer">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Trang cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive" className="gap-2.5 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
