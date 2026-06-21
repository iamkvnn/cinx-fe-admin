import { Users2, CheckSquare, ShieldAlert } from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const formatNumber = (val?: number) => {
  if (val === undefined || val === null) return "0"
  return val.toLocaleString('vi-VN')
}

interface UsersTabProps {
  userOverview?: {
    usersByRole?: Record<string, number>
    instructorsByVerificationStatus?: Record<string, number>
  }
  userChartData: Array<{
    name: string
    "Học viên mới": number
  }>
}

export function UsersTab({
  userOverview,
  userChartData,
}: UsersTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Học viên (Role: USER)</p>
              <h4 className="text-xl font-bold mt-1">{formatNumber(userOverview?.usersByRole?.USER)}</h4>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/10 text-purple-600 rounded-full">
              <Users2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Giảng viên đã duyệt</p>
              <h4 className="text-xl font-bold mt-1">
                {formatNumber(userOverview?.instructorsByVerificationStatus?.VERIFIED)}
              </h4>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/10 text-green-600 rounded-full">
              <CheckSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Giảng viên chờ duyệt</p>
              <h4 className="text-xl font-bold mt-1">
                {formatNumber(userOverview?.instructorsByVerificationStatus?.PENDING)}
              </h4>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-full">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Người dùng đăng ký mới</CardTitle>
            <CardDescription>Số lượng người dùng tạo tài khoản mới trên hệ thống.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {userChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Không có dữ liệu người dùng.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userChartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [formatNumber(Number(val)), "Tài khoản mới"]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Line type="monotone" dataKey="Học viên mới" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Vai trò Người dùng & Trạng thái Giảng viên</CardTitle>
            <CardDescription>Tỷ lệ các nhóm vai trò và hồ sơ duyệt của giảng viên.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cơ cấu vai trò</h4>
              {userOverview?.usersByRole && (
                (() => {
                  const totalUsers = Object.values(userOverview.usersByRole).reduce((a, b) => a + b, 0)
                  return Object.entries(userOverview.usersByRole).map(([role, count]) => {
                    const pct = totalUsers ? Math.round((count / totalUsers) * 100) : 0
                    return (
                      <div key={role} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="font-semibold">{role}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
                })()
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Trạng thái hồ sơ giảng viên
              </h4>
              {userOverview?.instructorsByVerificationStatus && (
                (() => {
                  const totalIns = Object.values(userOverview.instructorsByVerificationStatus).reduce((a, b) => a + b, 0)
                  return Object.entries(userOverview.instructorsByVerificationStatus).map(([status, count]) => {
                    const pct = totalIns ? Math.round((count / totalIns) * 100) : 0
                    let label = status
                    let colorClass = "bg-primary"
                    if (status === "VERIFIED") {
                      label = "Đã phê duyệt (Verified)"
                      colorClass = "bg-green-500"
                    } else if (status === "PENDING") {
                      label = "Chờ phê duyệt (Pending)"
                      colorClass = "bg-yellow-500"
                    } else if (status === "REJECTED") {
                      label = "Đã từ chối (Rejected)"
                      colorClass = "bg-red-500"
                    }
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{label}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })
                })()
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
