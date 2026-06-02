import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle, 
  Shield, 
  Calendar, 
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UserService, AuthService } from "@/services"
import { Skeleton } from "@/components/ui/skeleton"

// Zod schemas for validation
const profileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phoneNumber: z.string().regex(/^[0-9]*$/, "Số điện thoại chỉ được chứa chữ số").optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
})

const passwordSchema = z.object({
  oldPassword: z.string().min(6, "Mật khẩu hiện tại phải từ 6 ký tự"),
  newPassword: z.string().min(6, "Mật khẩu mới phải từ 6 ký tự"),
  confirmPassword: z.string().min(6, "Xác nhận mật khẩu phải từ 6 ký tự"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export function ProfilePage() {
  const queryClient = useQueryClient()
  const [profileSuccess, setProfileSuccess] = React.useState<string | null>(null)
  const [profileError, setProfileError] = React.useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null)
  const [passwordError, setPasswordError] = React.useState<string | null>(null)
  
  const [showOldPass, setShowOldPass] = React.useState(false)
  const [showNewPass, setShowNewPass] = React.useState(false)
  const [showConfirmPass, setShowConfirmPass] = React.useState(false)

  // 1. Fetch current user profile
  const { data: currentUserData, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => UserService.getCurrentUser(),
  })

  const currentUser = currentUserData?.data

  // 2. Setup forms
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Set default values when user is loaded
  React.useEffect(() => {
    if (currentUser) {
      resetProfile({
        name: currentUser.name || "",
        phoneNumber: currentUser.phoneNumber || "",
        gender: currentUser.gender || "MALE",
      })
    }
  }, [currentUser, resetProfile])

  // 3. Setup mutations
  const updateProfileMutation = useMutation({
    mutationFn: (body: ProfileFormData) => {
      if (!currentUser?.userId) throw new Error("Không tìm thấy UserId")
      return UserService.updateUser({ id: currentUser.userId, body })
    },
    onSuccess: (res) => {
      if (res.success) {
        setProfileSuccess("Cập nhật thông tin hồ sơ thành công!")
        setProfileError(null)
        queryClient.invalidateQueries({ queryKey: ["current-user"] })
      } else {
        setProfileError(res.message || "Cập nhật hồ sơ thất bại.")
        setProfileSuccess(null)
      }
    },
    onError: (err: any) => {
      setProfileError(err?.response?.data?.message || "Đã xảy ra lỗi khi kết nối hệ thống.")
      setProfileSuccess(null)
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: (body: PasswordFormData) => {
      return AuthService.changePassword({
        body: {
          email: currentUser?.email || "",
          oldPassword: body.oldPassword,
          newPassword: body.newPassword,
        }
      })
    },
    onSuccess: (res) => {
      if (res.success) {
        setPasswordSuccess("Đổi mật khẩu thành công!")
        setPasswordError(null)
        resetPassword()
      } else {
        setPasswordError(res.message || "Đổi mật khẩu thất bại.")
        setPasswordSuccess(null)
      }
    },
    onError: (err: any) => {
      setPasswordError(err?.response?.data?.message || "Đã xảy ra lỗi khi đổi mật khẩu.")
      setPasswordSuccess(null)
    }
  })

  const onUpdateProfile = (data: ProfileFormData) => {
    setProfileSuccess(null)
    setProfileError(null)
    updateProfileMutation.mutate(data)
  }

  const onChangePassword = (data: PasswordFormData) => {
    setPasswordSuccess(null)
    setPasswordError(null)
    changePasswordMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-96 lg:col-span-2 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Không thể tải thông tin hồ sơ của bạn. Vui lòng đăng nhập lại.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Trang cá nhân</h2>
        <p className="text-sm text-muted-foreground">
          Xem thông tin cá nhân và quản lý thiết lập tài khoản của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Profile Summary Card */}
        <Card className="overflow-hidden border border-border/80 shadow-md">
          <div className="h-28 bg-gradient-to-r from-primary/30 to-indigo-500/20 relative" />
          <CardContent className="pt-0 px-6 pb-6 relative text-center flex flex-col items-center">
            {/* Avatar block with border & hover zoom */}
            <div className="-mt-14 h-24 w-24 rounded-full overflow-hidden border-4 border-card bg-muted flex items-center justify-center text-primary font-bold text-3xl shadow-lg transition-transform duration-300 hover:scale-105">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                currentUser.name?.charAt(0).toUpperCase() || "A"
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold tracking-tight">{currentUser.name}</h3>
              <div className="flex items-center justify-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-primary uppercase text-xs tracking-wider">
                  {currentUser.role === 'ADMIN' ? 'Quản trị viên' : currentUser.role}
                </span>
              </div>
            </div>

            <div className="w-full border-t border-border/50 my-6" />

            <div className="w-full space-y-3.5 text-left text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                <span className="truncate text-foreground font-medium">{currentUser.email}</span>
              </div>

              {currentUser.phoneNumber && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                  <span className="text-foreground font-medium">{currentUser.phoneNumber}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                <span className="text-foreground">
                  Tham gia: <span className="font-semibold">{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN') : "N/A"}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Tab Panel Form */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-4 bg-muted/60 p-1 rounded-xl">
              <TabsTrigger value="info" className="rounded-lg gap-2 text-sm">
                <User className="h-4 w-4" />
                Thông tin cá nhân
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg gap-2 text-sm">
                <Lock className="h-4 w-4" />
                Đổi mật khẩu
              </TabsTrigger>
            </TabsList>

            {/* Profile Info Tab */}
            <TabsContent value="info" className="outline-none">
              <Card className="border border-border/80 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Cập nhật hồ sơ</CardTitle>
                  <CardDescription>
                    Thay đổi thông tin liên lạc và chi tiết hiển thị trong hồ sơ của bạn.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
                    {profileSuccess && (
                      <Alert className="border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <AlertTitle>Thành công</AlertTitle>
                        <AlertDescription>{profileSuccess}</AlertDescription>
                      </Alert>
                    )}

                    {profileError && (
                      <Alert variant="destructive">
                        <AlertTitle>Lỗi cập nhật</AlertTitle>
                        <AlertDescription>{profileError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="name" className="pl-9" {...registerProfile("name")} />
                        </div>
                        {profileErrors.name && (
                          <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Số điện thoại</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="phoneNumber" className="pl-9" {...registerProfile("phoneNumber")} />
                        </div>
                        {profileErrors.phoneNumber && (
                          <p className="text-xs text-destructive">{profileErrors.phoneNumber.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Giới tính</Label>
                        <select
                          id="gender"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...registerProfile("gender")}
                        >
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emailRead">Email (Không thể thay đổi)</Label>
                        <div className="relative opacity-60">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="emailRead" className="pl-9 bg-muted cursor-not-allowed" value={currentUser.email} disabled />
                        </div>
                      </div>
                    </div>



                    <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full md:w-auto">
                      {updateProfileMutation.isPending ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Change Password Tab */}
            <TabsContent value="security" className="outline-none">
              <Card className="border border-border/80 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Thay đổi mật khẩu</CardTitle>
                  <CardDescription>
                    Đảm bảo mật khẩu của bạn có độ bảo mật cao để bảo vệ tài khoản khỏi xâm nhập.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
                    {passwordSuccess && (
                      <Alert className="border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        <AlertTitle>Thành công</AlertTitle>
                        <AlertDescription>{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}

                    {passwordError && (
                      <Alert variant="destructive">
                        <AlertTitle>Lỗi đổi mật khẩu</AlertTitle>
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="oldPassword" 
                          type={showOldPass ? "text" : "password"} 
                          className="pl-9 pr-10" 
                          placeholder="Nhập mật khẩu đang sử dụng"
                          {...registerPassword("oldPassword")} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPass(!showOldPass)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.oldPassword && (
                        <p className="text-xs text-destructive">{passwordErrors.oldPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="newPassword" 
                          type={showNewPass ? "text" : "password"} 
                          className="pl-9 pr-10" 
                          placeholder="Ít nhất 6 ký tự"
                          {...registerPassword("newPassword")} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="confirmPassword" 
                          type={showConfirmPass ? "text" : "password"} 
                          className="pl-9 pr-10" 
                          placeholder="Nhập lại mật khẩu mới"
                          {...registerPassword("confirmPassword")} 
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={changePasswordMutation.isPending} className="w-full md:w-auto">
                      {changePasswordMutation.isPending ? "Đang đổi mật khẩu..." : "Thay đổi mật khẩu"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
