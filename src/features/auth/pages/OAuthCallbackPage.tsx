import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { Loader2, AlertCircle } from "lucide-react"
import { AuthService } from "@/services"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { Button } from "@/components/ui/button"

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setTokens } = useAuthStore()
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const loginWithGoogleMutation = useMutation({
    mutationFn: (body: { code: string; codeVerifier: string; device: "WEB"; role: "ADMIN" }) =>
      AuthService.loginWithGoogle({ body }),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setTokens(res.data)
        navigate("/", { replace: true })
      } else {
        setErrorMsg(res.message || "Đăng nhập Google thất bại.")
      }
    },
    onError: (err: any) => {
      console.error(err)
      setErrorMsg(err?.response?.data?.message || "Đã xảy ra lỗi khi kết nối máy chủ.")
    }
  })

  const hasCalledAuth = React.useRef(false)

  React.useEffect(() => {
    if (hasCalledAuth.current) return

    const code = searchParams.get("code")
    const codeVerifier = localStorage.getItem("google_oauth_code_verifier")

    if (!code) {
      setErrorMsg("Không tìm thấy mã xác thực (code) từ Google.")
      return
    }

    if (!codeVerifier) {
      setErrorMsg("Không tìm thấy mã bảo mật (code verifier) trong phiên làm việc của bạn.")
      return
    }

    hasCalledAuth.current = true

    // Clean up code verifier from storage
    localStorage.removeItem("google_oauth_code_verifier")

    loginWithGoogleMutation.mutate({
      code,
      codeVerifier,
      device: "WEB",
      role: "ADMIN"
    })
  }, [searchParams])

  return (
    <div className="min-h-screen w-full bg-[#f3f6fc] flex flex-col items-center justify-center p-4">
      {/* Soft colorful gradient blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-400/10 via-indigo-300/10 to-purple-300/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-300/10 via-purple-300/15 to-pink-300/10 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 md:p-10 space-y-6 text-center z-10 animate-in fade-in duration-300">
        {!errorMsg ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">Đang xử lý đăng nhập</h2>
            <p className="text-xs text-slate-400 font-medium">Vui lòng chờ trong khi hệ thống xác thực thông tin tài khoản Google của bạn...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mx-auto shadow-inner">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-800">Đăng nhập thất bại</h2>
              <p className="text-xs text-destructive font-medium leading-relaxed">{errorMsg}</p>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md active:scale-98 transition-all"
            >
              Quay lại trang đăng nhập
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
