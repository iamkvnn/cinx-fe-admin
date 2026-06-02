import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Eye } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { AdminCourseService } from "@/services"
import type { CourseResponse, PaginatedApiResponse } from "@/types"
import { StatusBadge } from "../components/StatusBadge"

const formatPrice = (p: number | undefined) =>
  p === undefined ? "0 ₫" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p)

const formatDate = (d: string | undefined) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : ""


const COLUMNS: Column<CourseResponse>[] = [
  { key: "id", title: "Mã KH", hideable: true, render: (c) => <span className="font-mono text-xs text-muted-foreground">{c.id?.substring(0, 8)}...</span> },
  { key: "title", title: "Tên khóa học", sortable: true, render: (c) => <span className="font-medium">{c.title}</span> },
  { key: "category", title: "Danh mục", hideable: true, render: (c) => <span>{c.category?.name || "N/A"}</span> },
  {
    key: "instructor", title: "Giảng viên", hideable: true, render: (c) => (
      <div className="flex flex-col">
        <span>{c.instructor?.name}</span>
        <span className="text-xs text-muted-foreground">{c.instructor?.email}</span>
      </div>
    )
  },
  { key: "price", title: "Giá bán", sortable: true, render: (c) => formatPrice(c.price as any) },
  { key: "updatedAt", title: "Cập nhật", hideable: true, render: (c) => formatDate(c.updatedAt || c.createdAt) },
  { key: "status", title: "Trạng thái", render: (c) => <StatusBadge status={(c as any).status} /> },
  { key: "actions", title: "Hành động", className: "text-right", render: () => null },
]

export function CoursesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange,
  } = useTableState(COLUMNS)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  const { data, isLoading } = useQuery({
    queryKey: ["courses", page, pageSize, debouncedSearch, statusFilter],
    queryFn: () => AdminCourseService.getAllCourses_1({
      page, size: pageSize,
      query: debouncedSearch || undefined,
      status: statusFilter === "ALL" ? undefined : (statusFilter as any),
    }),
  })

  const paginatedData: PaginatedApiResponse<CourseResponse> = data || {
    success: true,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }

  const columns: Column<CourseResponse>[] = [
    ...COLUMNS.slice(0, 7),
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (course) => (
        <Button variant="ghost" size="icon" onClick={() => navigate(`/courses/${course.id}`)} title="Xem chi tiết">
          <Eye className="h-4 w-4 text-primary" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Danh sách Khóa học</h2>
      </div>

      <DataTableWrapper
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortConfig={sortConfig}
        onSort={handleSort}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        emptyMessage="Không tìm thấy khóa học nào."
        onRowClick={(course) => navigate(`/courses/${course.id}`)}
        toolbarContent={
          <div className="flex items-center gap-2 w-full">
            <Input
              type="search"
              placeholder="Tìm kiếm khóa học..."
              className="max-w-sm"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); handlePageChange(1) }}
            />
            <Select value={statusFilter} onValueChange={val => { setStatusFilter(val || "ALL"); handlePageChange(1) }}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="WAITING_APPROVAL">Chờ duyệt</SelectItem>
                  <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                  <SelectItem value="REJECTED">Từ chối</SelectItem>
                  <SelectItem value="DRAFT">Bản nháp</SelectItem>
                  <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  )
}
