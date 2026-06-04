import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import {
  GraduationCap,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Users,
  BookOpen,
  User,
  BarChart3
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthService } from "@/services"
import { useAuthStore } from "@/features/auth/store/useAuthStore"

import type { AuthRequestDto } from "@/types"

const loginSchema = z.object({
  email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { setTokens, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)

  // Nếu đã đăng nhập → redirect luôn
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: (body: AuthRequestDto) => AuthService.login({ body }),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setTokens(data.data)
        navigate("/", { replace: true })
      }
    },
  })

  const onSubmit = (formData: LoginFormData) => {
    loginMutation.mutate(formData)
  }

  const handleGoogleLogin = () => {
    console.log("Google Login clicked")
  }

  return (
    <div className="min-h-screen w-full bg-[#f3f6fc] font-sans flex items-center justify-center p-4 md:p-8 selection:bg-blue-500 selection:text-white relative overflow-hidden">
      
      {/* Soft colorful gradient blobs in the background (Mesh Gradient) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-400/20 via-indigo-300/20 to-purple-300/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-300/15 via-purple-300/25 to-pink-300/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[25%] left-[30%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-cyan-300/15 to-blue-300/20 blur-[100px] pointer-events-none" />

      {/* Dotted grid pattern at the bottom-left corner */}
      <svg className="absolute bottom-0 left-0 w-64 h-64 text-blue-600/[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <defs>
          <pattern id="bg-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-dots)" />
      </svg>

      {/* Concentric circles behind the laptop (middle-left area) */}
      <svg className="absolute top-[25%] left-[-8%] w-[500px] h-[500px] text-blue-900/[0.03] pointer-events-none hidden md:block" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
        <circle cx="50" cy="50" r="45" />
        <circle cx="50" cy="50" r="35" />
        <circle cx="50" cy="50" r="25" />
        <circle cx="50" cy="50" r="15" />
      </svg>

      {/* Concentric circles in the top-right corner */}
      <svg className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] text-blue-900/[0.03] pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
        <circle cx="100" cy="0" r="90" />
        <circle cx="100" cy="0" r="75" />
        <circle cx="100" cy="0" r="60" />
        <circle cx="100" cy="0" r="45" />
        <circle cx="100" cy="0" r="30" />
      </svg>

      {/* Background slanted separator */}
      <div className="absolute right-1/2 top-0 h-full w-[20%] bg-white/40 blur-3xl transform skew-x-12 pointer-events-none hidden md:block" />

      {/* Main Container: max-w-5xl (1024px) for perfect balance on wide screens */}
      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 md:gap-12 items-center z-10">
        
        {/* ─── LEFT COLUMN: Brand Presentation & Dashboard Mockup ─── */}
        <div className="md:col-span-6 flex flex-col justify-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <GraduationCap className="h-9 w-9 text-blue-600 shrink-0" strokeWidth={2.2} />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#0f172a] leading-none">EduManage</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Hệ thống quản lý đào tạo</span>
            </div>
          </div>

          {/* Heading with pill + dot underline */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] leading-[1.15] tracking-tight">
              Quản lý <span className="text-blue-600">hiệu quả</span> <br />
              Nâng tầm giáo dục
            </h1>
            
            {/* The "— ." dash-dot underline decoration */}
            <div className="flex items-center gap-1.5 mt-3">
              <div className="h-[4px] w-8 bg-blue-600 rounded-full" />
              <div className="h-[4px] w-[4px] bg-blue-600 rounded-full" />
            </div>
            
            <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-md pt-2">
              EduManage giúp quản lý toàn diện doanh thu, khóa học, học viên và giảng viên trên một nền tảng duy nhất.
            </p>
          </div>

          {/* Laptop and rounded square (squircle) floating icons - Laptop wrapper scaled up */}
          <div className="relative w-full max-w-[460px] md:max-w-[520px] lg:max-w-[560px] aspect-[1.35] pt-12 mx-auto md:mx-0 select-none">
            
            {/* Floating Icon 1: Blue Stats (Top Middle-Left) */}
            <div className="absolute top-[3%] left-[24%] z-20 h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center shadow-lg shadow-blue-600/35 animate-float-slow border border-white">
              <BarChart3 className="h-5.5 w-5.5" />
            </div>

            {/* Floating Icon 2: Purple Users (Top Right) */}
            <div className="absolute top-[22%] -right-4 z-20 h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 animate-float-medium border border-white">
              <Users className="h-5.5 w-5.5" />
            </div>

            {/* Floating Icon 3: Green Graduation Cap (Middle Right) */}
            <div className="absolute bottom-[28%] -right-8 z-20 h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-[#10b981] to-[#34d399] text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 animate-float-fast border border-white">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>

            {/* Floating Icon 4: Orange Book (Bottom Right) */}
            <div className="absolute bottom-[6%] -right-2 z-20 h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-600/35 animate-float-slow border border-white">
              <BookOpen className="h-5.5 w-5.5" />
            </div>

            {/* Combined Laptop Mockup (Physical Screen and Base connected) - Screen width takes full container */}
            <div className="w-full relative">
              {/* Screen Bezel (Silver/White Laptop) - Increased padding for clear visibility */}
              <div className="w-full aspect-[1.58] bg-[#cbd5e1] p-1.5 shadow-2xl rounded-t-2xl border border-white/90 flex flex-col relative z-10">
                
                {/* Camera dot */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-800" />

                {/* Screen Content - Scale up all text and graphs inside */}
                <div className="w-full h-full bg-white rounded-xl overflow-hidden flex border border-slate-200/60 shadow-inner">
                  
                  {/* Sidebar mockup - Wider for readable items */}
                  <div className="w-[30%] border-r border-slate-100 bg-slate-50/80 p-2 flex flex-col gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center text-[6px] text-white">
                        <GraduationCap className="h-2 w-2" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-800 leading-none">EduManage</span>
                    </div>
                    <div className="h-4.5 w-full rounded bg-blue-50 text-blue-600 flex items-center px-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm mr-1.5 shrink-0" />
                      <span className="text-[6.5px] font-bold leading-none">Dashboard</span>
                    </div>
                    <div className="h-4.5 w-full rounded text-slate-400 flex items-center px-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-sm mr-1.5 shrink-0" />
                      <span className="text-[6.5px] font-medium leading-none">Khóa học</span>
                    </div>
                    <div className="h-4.5 w-full rounded text-slate-400 flex items-center px-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-sm mr-1.5 shrink-0" />
                      <span className="text-[6.5px] font-medium leading-none">Học viên</span>
                    </div>
                    <div className="h-4.5 w-full rounded text-slate-400 flex items-center px-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-sm mr-1.5 shrink-0" />
                      <span className="text-[6.5px] font-medium leading-none">Giảng viên</span>
                    </div>
                  </div>

                  {/* Main Dashboard Content mockup - Scale up fonts */}
                  <div className="flex-1 bg-white p-2.5 flex flex-col gap-2.5 justify-between">
                    <div className="flex justify-between items-center text-[6px] text-slate-400">
                      <span className="font-bold text-slate-500 text-[8px]">Tổng quan hệ thống</span>
                    </div>

                    {/* KPI stats */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between relative shadow-sm">
                        <span className="text-[5.5px] text-slate-400 leading-none">Tổng doanh thu</span>
                        <span className="text-[8.5px] font-bold text-slate-800 leading-none mt-1">248.5M</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-1.5 top-1.5" />
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between relative shadow-sm">
                        <span className="text-[5.5px] text-slate-400 leading-none">Tổng học viên</span>
                        <span className="text-[8.5px] font-bold text-slate-800 leading-none mt-1">1,248</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 absolute right-1.5 top-1.5" />
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between relative shadow-sm">
                        <span className="text-[5.5px] text-slate-400 leading-none">Tổng khoá học</span>
                        <span className="text-[8.5px] font-bold text-slate-800 leading-none mt-1">128</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 absolute right-1.5 top-1.5" />
                      </div>
                    </div>

                    {/* SVG Curve Chart with mathematically aligned data points and horizontal grid lines */}
                    <div className="flex-1 rounded-lg bg-slate-50 border border-slate-100 p-2 flex flex-col justify-between overflow-hidden shadow-sm min-h-[80px]">
                      <span className="text-[6px] text-slate-400 font-semibold leading-none">Doanh thu theo tháng</span>
                      <div className="flex-1 relative flex items-end mt-1.5">
                        
                        {/* Custom Horizontal Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                          <div className="border-b border-slate-200/50 w-full h-0" />
                          <div className="border-b border-slate-200/50 w-full h-0" />
                          <div className="border-b border-slate-200/50 w-full h-0" />
                          <div className="w-full h-0" />
                        </div>

                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 45" preserveAspectRatio="none">
                          <path
                            d="M0,38 C5,38 10,34 15,34 C20,34 25,20 30,20 C35,20 40,28 45,28 C50,28 55,10 60,10 C65,10 70,24 75,24 C80,24 85,15 90,15 C95,15 100,12 100,12 L100 45 L0 45 Z"
                            fill="url(#chartGrad)"
                          />
                          <path
                            d="M0,38 C5,38 10,34 15,34 C20,34 25,20 30,20 C35,20 40,28 45,28 C50,28 55,10 60,10 C65,10 70,24 75,24 C80,24 85,15 90,15 C95,15 100,12 100,12"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Data points along chart line (Enlarged and aligned to Cubic Bezier Endpoints) */}
                          <circle cx="0" cy="38" r="1.8" fill="white" stroke="#2563eb" strokeWidth="1" />
                          <circle cx="15" cy="34" r="1.8" fill="white" stroke="#2563eb" strokeWidth="1" />
                          <circle cx="30" cy="20" r="1.8" fill="white" stroke="#2563eb" strokeWidth="1" />
                          <circle cx="45" cy="28" r="1.8" fill="white" stroke="#2563eb" strokeWidth="1" />
                          <circle cx="60" cy="10" r="1.8" fill="white" stroke="#2563eb" strokeWidth="1" />
                          <circle cx="75" cy="24" r="1.8" fill="white" stroke="#2563eb" strokeWidth="1" />
                          <circle cx="90" cy="15" r="1.8" fill="white" stroke="#2563eb" strokeWidth="1" />
                          <circle cx="100" cy="12" r="1.8" fill="white" stroke="#2563eb" strokeWidth="1" />
                        </svg>

                        {/* Top corner percentage */}
                        <div className="absolute right-1 top-0 flex gap-0.5 items-center bg-green-500/10 px-0.8 py-0.2 rounded scale-90 origin-top-right shadow-sm">
                          <span className="text-[4px] font-extrabold text-green-600">+12.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Keyboard Base: physically touching screen bezel with correct margin */}
              <div className="w-[106%] -ml-[3%] h-3.5 bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1] rounded-b-2xl border-t border-white shadow-[0_12px_24px_-10px_rgba(0,0,0,0.25)] flex items-start justify-center relative z-20 -mt-0.5">
                {/* Trackpad */}
                <div className="w-[18%] h-1.5 bg-[#cbd5e1] rounded-b-sm border-t border-slate-300" />
              </div>
            </div>

          </div>
        </div>

        {/* ─── RIGHT COLUMN: Form Card ─── */}
        <div className="md:col-span-6 flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="w-full max-w-[420px] space-y-6">
            
            {/* White Rounded Card container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 md:p-10 space-y-6">
              
              {/* Blue top Lock Circle */}
              <div className="text-center">
                <div className="h-14 w-14 rounded-full bg-blue-50/80 flex items-center justify-center text-blue-600 shadow-inner mx-auto mb-4 border border-blue-100/10">
                  <Lock className="h-5.5 w-5.5" fill="currentColor" fillOpacity="0.1" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Đăng nhập hệ thống</h2>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">Chào mừng bạn quay trở lại EduManage</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Error Banner */}
                {loginMutation.isError && (
                  <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive animate-in fade-in duration-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                    <span className="font-semibold">
                      {(loginMutation.error as any)?.response?.data?.message ||
                        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."}
                    </span>
                  </div>
                )}

                {/* Email Input Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700 ml-1">
                    Email hoặc tên đăng nhập
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Nhập email hoặc tên đăng nhập"
                      className="pl-11 h-12 rounded-full border-slate-200 bg-white focus-visible:ring-1 focus-visible:ring-blue-600 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1 font-medium ml-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Input Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700 ml-1">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      className="pl-11 pr-11 h-12 rounded-full border-slate-200 bg-white focus-visible:ring-1 focus-visible:ring-blue-600 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1 font-medium ml-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember & Forgot password */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
                    />
                    <label htmlFor="remember" className="text-slate-500 cursor-pointer font-medium hover:text-slate-700 select-none">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/10 mt-3 active:scale-98"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    "Đang đăng nhập..."
                  ) : (
                    <>
                      <LogIn className="h-4.5 w-4.5" />
                      <span>Đăng nhập</span>
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-100" />
                <span className="flex-shrink mx-4 text-slate-400 text-[11px] font-semibold bg-white px-2">hoặc</span>
                <div className="flex-grow border-t border-slate-100" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-12 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-98"
              >
                <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Đăng nhập với Google</span>
              </button>

              {/* Register Helper */}
              <div className="text-center text-xs text-slate-500">
                Chưa có tài khoản?{" "}
                <span className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer font-semibold">
                  Liên hệ quản trị hệ thống
                </span>
              </div>

            </div>

            {/* Footer Shield check */}
            <div className="flex items-start gap-3 max-w-[400px] mx-auto px-4 py-1">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-slate-800">Bảo mật thông tin tuyệt đối</span>
                <span className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Hệ thống được bảo vệ với công nghệ mã hóa tiên tiến
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
