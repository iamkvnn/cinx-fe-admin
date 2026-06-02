import { Badge } from "@/components/ui/badge"
import type { UserDto } from "@/types"

interface RoleBadgeProps {
  role?: string
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (role === "ADMIN") return <Badge>Admin</Badge>
  if (role === "INSTRUCTOR") return <Badge variant="secondary">Instructor</Badge>
  return <Badge variant="outline">User</Badge>
}

interface UserStatusBadgeProps {
  user: UserDto
}

export function UserStatusBadge({ user }: UserStatusBadgeProps) {
  if (user.status === "BANNED") return <Badge variant="destructive">Bị khóa</Badge>
  if (user.isInstructorVerified) return <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">Đã xác minh</Badge>
  if (user.role === "INSTRUCTOR") return <Badge variant="secondary">Chờ xác minh</Badge>
  return <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">Hoạt động</Badge>
}
