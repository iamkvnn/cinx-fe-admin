import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import {
  GraduationCap,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Users,
  BookOpen,
  BarChart3
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthService } from "@/services"

// ─── STEP 1 SCHEMA: REQUEST OTP ───
const requestOtpSchema = z.object({
  email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
})
type RequestOtpFormData = z.infer<typeof requestOtpSchema>

// ─── STEP 2 SCHEMA: RESET PASSWORD ───
const resetPasswordSchema = z.object({
  otp: z.string().min(1, "Mã OTP không được để trống").min(4, "Mã OTP phải có tối thiểu 4 ký tự"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có tối thiểu 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
})
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

type FlowStep = "REQUEST_OTP" | "RESET_PASSWORD" | "SUCCESS"

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = React.useState<FlowStep>("REQUEST_OTP")
  const [userEmail, setUserEmail] = React.useState("")
  const [countdown, setCountdown] = React.useState(0)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  // ─── Countdown Timer for OTP resending ───
  React.useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // ─── Auto redirect to login on success step ───
  React.useEffect(() => {
    if (step !== "SUCCESS") return
    const redirectTimer = setTimeout(() => {
      navigate("/login")
    }, 4000)
    return () => clearTimeout(redirectTimer)
  }, [step, navigate])

  // ─── Step 1 Form: Request OTP ───
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest },
  } = useForm<RequestOtpFormData>({
    resolver: zodResolver(requestOtpSchema),
  })

  // ─── Step 2 Form: Reset Password ───
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // ─── Mutation: Send/Resend OTP ───
  const sendOtpMutation = useMutation({
    mutationFn: (email: string) => AuthService.resendOtp({ body: { email } }),
    onSuccess: (_, email) => {
      setUserEmail(email)
      setCountdown(60) // Start 60s cooldown
      if (step === "REQUEST_OTP") {
        setStep("RESET_PASSWORD")
      }
    },
  })

  // ─── Mutation: Reset Password ───
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordFormData) =>
      AuthService.resetPassword({
        body: {
          email: userEmail,
          otp: data.otp,
          newPassword: data.newPassword,
        },
      }),
    onSuccess: (data) => {
      if (data.success) {
        setStep("SUCCESS")
      }
    },
  })

  const onSubmitRequest = (formData: RequestOtpFormData) => {
    sendOtpMutation.mutate(formData.email)
  }

  const onSubmitReset = (formData: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(formData)
  }

  const handleResendOtp = () => {
    if (countdown > 0) return
    sendOtpMutation.mutate(userEmail)
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

      {/* Main Container */}
      <div className="w-full max-w-6xl grid md:grid-cols-12 gap-8 md:gap-12 items-center z-10">

        {/* ─── LEFT COLUMN: Brand Presentation & Dashboard Mockup ─── */}
        <div className="md:col-span-6 flex flex-col justify-center space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">

          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-blue-600 shrink-0">
              <GraduationCap className="h-9 w-9" strokeWidth={2.2} />
            </Link>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#0f172a] leading-none">CinxManage</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-1">Hệ thống quản lý đào tạo</span>
            </div>
          </div>

          {/* Taglines with dash-dot underline */}
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
              CinxManage giúp quản lý toàn diện doanh thu, khóa học, học viên và giảng viên trên một nền tảng duy nhất.
            </p>
          </div>

          {/* Laptop and rounded square (squircle) floating icons - Laptop wrapper scaled up */}
          <div className="relative w-full max-w-[460px] md:max-w-[520px] lg:max-w-[560px] aspect-[1.35] pt-12 mx-auto md:mx-0 select-none">

            {/* Floating Icon 1 */}
            <div className="absolute top-[3%] left-[24%] z-20 h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center shadow-lg shadow-blue-600/35 animate-float-slow border border-white">
              <BarChart3 className="h-5.5 w-5.5" />
            </div>

            {/* Floating Icon 2 */}
            <div className="absolute top-[22%] -right-4 z-20 h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 animate-float-medium border border-white">
              <Users className="h-5.5 w-5.5" />
            </div>

            {/* Floating Icon 3 */}
            <div className="absolute bottom-[28%] -right-8 z-20 h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-[#10b981] to-[#34d399] text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 animate-float-fast border border-white">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>

            {/* Floating Icon 4 */}
            <div className="absolute bottom-[6%] -right-2 z-20 h-12 w-12 rounded-[1.25rem] bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-600/35 animate-float-slow border border-white">
              <BookOpen className="h-5.5 w-5.5" />
            </div>

            {/* Combined Laptop Mockup (Physical Screen and Base connected) - Screen width takes full container */}
            <div className="w-full relative">
              {/* Screen Bezel (Silver/White Laptop) - Increased padding for clear visibility */}
              <div className="w-full aspect-[1.56] bg-[#cbd5e1] p-1.5 shadow-2xl rounded-t-2xl border border-white/90 flex flex-col relative z-10">

                {/* Camera dot */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-800" />

                {/* Screen Content */}
                <div className="w-full h-full bg-white rounded-xl overflow-hidden flex border border-slate-200/60 shadow-inner">

                  {/* Sidebar mockup */}
                  <div className="w-[30%] border-r border-slate-100 bg-slate-50/80 p-2 flex flex-col gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center text-[6px] text-white">
                        <GraduationCap className="h-2 w-2" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-800 leading-none">CinxManage</span>
                    </div>
                    <div className="h-4.5 w-full rounded bg-blue-50 text-blue-600 flex items-center px-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm mr-1.5 shrink-0" />
                      <span className="text-[6.5px] font-bold leading-none">Dashboard</span>
                    </div>
                  </div>

                  {/* Main content mockup */}
                  <div className="flex-1 bg-white p-2.5 flex flex-col gap-1.5 justify-center items-center">
                    <ShieldCheck className="h-7 w-7 text-blue-600 animate-pulse" />
                    <span className="text-[8px] font-bold text-slate-400 mt-1">Khôi phục mật khẩu</span>
                  </div>

                </div>
              </div>

              {/* Keyboard Base */}
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

            {/* Back to Login link */}
            {step !== "SUCCESS" && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer group px-1"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span>Quay lại đăng nhập</span>
              </Link>
            )}

            {/* White Rounded Card container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 md:p-10 space-y-6">

              {/* STEP 1: REQUEST OTP */}
              {step === "REQUEST_OTP" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-full bg-blue-50/80 flex items-center justify-center text-blue-600 shadow-inner mx-auto mb-4 border border-blue-100/10">
                      <KeyRound className="h-5.5 w-5.5" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Quên mật khẩu?</h2>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">Nhập email của bạn để nhận mã xác thực OTP</p>
                  </div>

                  <form onSubmit={handleSubmitRequest(onSubmitRequest)} className="space-y-4">
                    {sendOtpMutation.isError && (
                      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive animate-in fade-in duration-300">
                        <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                        <span className="font-semibold">
                          {(sendOtpMutation.error as any)?.response?.data?.message ||
                            "Có lỗi xảy ra khi gửi mã OTP. Vui lòng kiểm tra lại."}
                        </span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-700 ml-1">
                        Email đăng ký
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Nhập email tài khoản"
                          className="pl-11 h-12 rounded-full border-slate-200 bg-white focus-visible:ring-1 focus-visible:ring-blue-600 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                          {...registerRequest("email")}
                        />
                      </div>
                      {errorsRequest.email && (
                        <p className="text-xs text-destructive mt-1 font-medium ml-1">{errorsRequest.email.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/10 mt-3 active:scale-98"
                      disabled={sendOtpMutation.isPending}
                    >
                      {sendOtpMutation.isPending ? (
                        "Đang gửi mã OTP..."
                      ) : (
                        <>
                          <span>Gửi mã OTP</span>
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {/* STEP 2: RESET PASSWORD */}
              {step === "RESET_PASSWORD" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-full bg-blue-50/80 flex items-center justify-center text-blue-600 shadow-inner mx-auto mb-4 border border-blue-100/10">
                      <ShieldCheck className="h-5.5 w-5.5" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Đặt lại mật khẩu</h2>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">Nhập mã xác thực OTP đã được gửi đến {userEmail}</p>
                  </div>

                  <form onSubmit={handleSubmitReset(onSubmitReset)} className="space-y-4">
                    {resetPasswordMutation.isError && (
                      <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive animate-in fade-in duration-300">
                        <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                        <span className="font-semibold">
                          {(resetPasswordMutation.error as any)?.response?.data?.message ||
                            "Đặt lại mật khẩu thất bại. Vui lòng kiểm tra lại mã OTP."}
                        </span>
                      </div>
                    )}

                    {/* OTP Input */}
                    <div className="space-y-1.5">
                      <Label htmlFor="otp" className="text-xs font-semibold text-slate-700 ml-1">
                        Mã xác thực OTP
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Nhập mã OTP"
                        className="h-12 rounded-full border-slate-200 bg-white focus-visible:ring-1 focus-visible:ring-blue-600 transition-all font-mono tracking-widest text-center text-lg font-bold shadow-sm"
                        {...registerReset("otp")}
                      />
                      {errorsReset.otp && (
                        <p className="text-xs text-destructive mt-1 font-medium ml-1">{errorsReset.otp.message}</p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-700 ml-1">
                        Mật khẩu mới
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                          className="pl-11 pr-11 h-12 rounded-full border-slate-200 bg-white focus-visible:ring-1 focus-visible:ring-blue-600 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                          {...registerReset("newPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                      {errorsReset.newPassword && (
                        <p className="text-xs text-destructive mt-1 font-medium ml-1">{errorsReset.newPassword.message}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700 ml-1">
                        Xác nhận mật khẩu mới
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-4.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Xác nhận lại mật khẩu mới"
                          className="pl-11 pr-11 h-12 rounded-full border-slate-200 bg-white focus-visible:ring-1 focus-visible:ring-blue-600 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                          {...registerReset("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                      {errorsReset.confirmPassword && (
                        <p className="text-xs text-destructive mt-1 font-medium ml-1">{errorsReset.confirmPassword.message}</p>
                      )}
                    </div>

                    {/* Resend OTP cooldown */}
                    <div className="text-center py-1">
                      {countdown > 0 ? (
                        <p className="text-xs text-slate-400 font-medium">
                          Gửi lại mã OTP sau <span className="font-bold text-blue-600">{countdown}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={sendOtpMutation.isPending}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {sendOtpMutation.isPending ? "Đang gửi lại..." : "Chưa nhận được mã? Gửi lại OTP"}
                        </button>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/10 mt-3 active:scale-98"
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending ? (
                        "Đang khôi phục mật khẩu..."
                      ) : (
                        <>
                          <span>Đặt lại mật khẩu</span>
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {/* STEP 3: SUCCESS */}
              {step === "SUCCESS" && (
                <div className="text-center py-4 space-y-6 animate-in scale-in duration-300">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-md">
                      <CheckCircle2 className="h-10 w-10 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">Thành công!</h3>
                    <p className="text-xs text-slate-400 mt-1.5 font-medium">
                      Mật khẩu của bạn đã được đổi thành công.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Đang tự động chuyển hướng về trang Đăng nhập...
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center cursor-pointer shadow-lg shadow-blue-600/10"
                  >
                    Đăng nhập ngay
                  </Button>
                </div>
              )}

            </div>

            {/* Bottom Shield check */}
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
