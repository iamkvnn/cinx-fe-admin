import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Eye, Filter, FilterX } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { AdminCourseService, CategoryService, UserService } from "@/services"
import type { CourseResponse, PaginatedApiResponse } from "@/types"
import { StatusBadge, getCourseDisplayStatus } from "../components/StatusBadge"

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
  { key: "status", title: "Trạng thái", render: (c) => <StatusBadge status={getCourseDisplayStatus(c)} /> },
  { key: "actions", title: "Hành động", className: "text-right", render: () => null },
]

export function CoursesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  
  const [categoryFilter, setCategoryFilter] = React.useState("ALL")
  const [instructorFilter, setInstructorFilter] = React.useState("ALL")
  const [ratingFilter, setRatingFilter] = React.useState("ALL")
  
  const [priceFrom, setPriceFrom] = React.useState("")
  const [debouncedPriceFrom, setDebouncedPriceFrom] = React.useState("")
  
  const [priceTo, setPriceTo] = React.useState("")
  const [debouncedPriceTo, setDebouncedPriceTo] = React.useState("")
  
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange,
  } = useTableState(COLUMNS)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedPriceFrom(priceFrom), 500)
    return () => clearTimeout(t)
  }, [priceFrom])

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedPriceTo(priceTo), 500)
    return () => clearTimeout(t)
  }, [priceTo])

  // Fetch Category options
  const { data: categoriesData } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => CategoryService.getAllCategories(),
  })
  const categories = categoriesData?.data || []

  // Fetch Instructor options
  const { data: instructorsData } = useQuery({
    queryKey: ["instructors-all"],
    queryFn: () => UserService.getAllUsers({ role: "INSTRUCTOR", size: 100 }),
  })
  const instructors = instructorsData?.data || []
  const { data, isLoading } = useQuery({
    queryKey: [
      "courses", page, pageSize, debouncedSearch, statusFilter,
      categoryFilter, instructorFilter, ratingFilter, debouncedPriceFrom, debouncedPriceTo
    ],
    queryFn: () => {
      const isPublishStatus = ["WAITING_APPROVAL", "REJECTED"].includes(statusFilter)
      return AdminCourseService.getAllCourses_1({
        page, size: pageSize,
        query: debouncedSearch || undefined,
        status: (statusFilter === "ALL" || isPublishStatus) ? undefined : (statusFilter as any),
        publishStatus: isPublishStatus ? (statusFilter as any) : undefined,
        categoryId: categoryFilter === "ALL" ? undefined : categoryFilter,
        instructorId: instructorFilter === "ALL" ? undefined : instructorFilter,
        rating: ratingFilter === "ALL" ? undefined : Number(ratingFilter),
        priceFrom: debouncedPriceFrom ? Number(debouncedPriceFrom) : undefined,
        priceTo: debouncedPriceTo ? Number(debouncedPriceTo) : undefined,
      })
    },
  })

  const paginatedData: PaginatedApiResponse<CourseResponse> = data || {
    success: true,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }

  const activeAdvancedCount = [
    statusFilter !== "ALL",
    categoryFilter !== "ALL",
    instructorFilter !== "ALL",
    ratingFilter !== "ALL",
    priceFrom !== "",
    priceTo !== "",
  ].filter(Boolean).length

  const handleResetFilters = () => {
    setSearchTerm("")
    setStatusFilter("ALL")
    setCategoryFilter("ALL")
    setInstructorFilter("ALL")
    setRatingFilter("ALL")
    setPriceFrom("")
    setPriceTo("")
    handlePageChange(1)
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

      {showAdvanced && (
        <Card className="p-4 bg-muted/30 border shadow-inner animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Trạng thái</label>
              <Select value={statusFilter} onValueChange={val => { setStatusFilter(val || "ALL"); handlePageChange(1) }}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="WAITING_APPROVAL">Chờ duyệt</SelectItem>
                  <SelectItem value="PUBLISHED">Đã xuất bản</SelectItem>
                  <SelectItem value="REJECTED">Từ chối</SelectItem>
                  <SelectItem value="DRAFT">Bản nháp</SelectItem>
                  <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Danh mục</label>
              <Select value={categoryFilter} onValueChange={val => { setCategoryFilter(val || "ALL"); handlePageChange(1) }}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id || ""}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Giảng viên</label>
              <Select value={instructorFilter} onValueChange={val => { setInstructorFilter(val || "ALL"); handlePageChange(1) }}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Chọn giảng viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả giảng viên</SelectItem>
                  {instructors.map((ins: any) => (
                    <SelectItem key={ins.userId} value={ins.userId || ""}>
                      {ins.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Đánh giá</label>
              <Select value={ratingFilter} onValueChange={val => { setRatingFilter(val || "ALL"); handlePageChange(1) }}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Tất cả đánh giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả đánh giá</SelectItem>
                  <SelectItem value="4">&ge; 4 sao</SelectItem>
                  <SelectItem value="3">&ge; 3 sao</SelectItem>
                  <SelectItem value="2">&ge; 2 sao</SelectItem>
                  <SelectItem value="1">&ge; 1 sao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Giá từ (₫)</label>
              <Input
                type="number"
                placeholder="Tối thiểu"
                className="bg-background"
                value={priceFrom}
                onChange={e => { setPriceFrom(e.target.value); handlePageChange(1) }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Giá đến (₫)</label>
              <Input
                type="number"
                placeholder="Tối đa"
                className="bg-background"
                value={priceTo}
                onChange={e => { setPriceTo(e.target.value); handlePageChange(1) }}
              />
            </div>
          </div>
        </Card>
      )}

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
          <div className="flex items-center justify-between gap-4 w-full">
            <Input
              type="search"
              placeholder="Tìm kiếm khóa học..."
              className="max-w-sm w-full sm:w-[280px]"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); handlePageChange(1) }}
            />
            
            <div className="flex items-center gap-2">
              <Button 
                variant={showAdvanced ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 h-9"
              >
                <Filter className="h-4 w-4" />
                Bộ lọc nâng cao
                {activeAdvancedCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-5 bg-background text-foreground text-[10px] font-semibold border shadow-sm">
                    {activeAdvancedCount}
                  </Badge>
                )}
              </Button>
              
              {(searchTerm !== "" || statusFilter !== "ALL" || activeAdvancedCount > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 h-9 text-muted-foreground hover:text-destructive"
                >
                  <FilterX className="h-4 w-4" />
                  Đặt lại
                </Button>
              )}
            </div>
          </div>
        }
      />
    </div>
  )
}
