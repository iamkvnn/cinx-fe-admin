import * as React from "react"
import { Plus, Edit2, Archive, Check, Eye, ArrowUp, ArrowDown, Trash2, PlusCircle } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { PolicyService } from "@/services"
import type { PolicySummaryResponse, PolicySectionRequest, CreatePolicyRequest, UpdatePolicyRequest } from "@/types"
import { toast } from "sonner"

const COLUMNS: Column<PolicySummaryResponse>[] = [
  { key: "policyType", title: "Loại chính sách", sortable: true },
  { key: "title", title: "Tiêu đề", sortable: true },
  { key: "slug", title: "Slug / Đường dẫn" },
  { key: "status", title: "Trạng thái", sortable: true },
  { key: "versionNumber", title: "Phiên bản", sortable: true },
  { key: "effectiveAt", title: "Hiệu lực từ", sortable: true },
  { key: "displayOrder", title: "Thứ tự hiển thị", sortable: true },
  { key: "actions", title: "Hành động", className: "text-right" },
]

export function PoliciesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterType, setFilterType] = React.useState<string>("ALL")
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL")

  // Modal control states
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isViewOpen, setIsViewOpen] = React.useState(false)

  // Policy Form states
  const [editingPolicyId, setEditingPolicyId] = React.useState<string | null>(null)
  const [viewingPolicyId, setViewingPolicyId] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [policyType, setPolicyType] = React.useState<"PRIVACY" | "TERMS" | "REFUND" | "COOKIE" | "GENERAL">("GENERAL")
  const [summary, setSummary] = React.useState("")
  const [effectiveAt, setEffectiveAt] = React.useState("")
  const [displayOrder, setDisplayOrder] = React.useState(0)
  const [sections, setSections] = React.useState<PolicySectionRequest[]>([])

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange
  } = useTableState(COLUMNS)

  // Query: Get policy versions
  const { data, isLoading } = useQuery({
    queryKey: ["policy-versions", page, pageSize, filterType, filterStatus, searchTerm, sortConfig],
    queryFn: () => PolicyService.getPolicyVersions({
      page,
      size: pageSize,
      policyType: filterType === "ALL" ? undefined : filterType,
      status: filterStatus === "ALL" ? undefined : filterStatus,
      query: searchTerm.trim() || undefined,
      sort: sortConfig ? `${sortConfig.key},${sortConfig.direction}` : undefined
    }),
  })

  // Query: Get single policy detail (for edit or view)
  const { data: policyDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["policy-detail", editingPolicyId || viewingPolicyId],
    queryFn: () => PolicyService.getPolicyDetail({ id: (editingPolicyId || viewingPolicyId)! }),
    enabled: !!(editingPolicyId || viewingPolicyId),
  })

  // Initialize form when detail changes
  React.useEffect(() => {
    if (editingPolicyId && policyDetail?.data) {
      const p = policyDetail.data
      setTitle(p.title || "")
      setSlug(p.slug || "")
      setPolicyType(p.policyType || "GENERAL")
      setSummary(p.summary || "")
      setEffectiveAt(p.effectiveAt ? p.effectiveAt.substring(0, 16) : "")
      setDisplayOrder(p.displayOrder ?? 0)
      setSections(p.sections?.map(s => ({
        heading: s.heading || "",
        anchor: s.anchor || "",
        bodyMarkdown: s.bodyMarkdown || "",
        orderIndex: s.orderIndex ?? 0
      })) || [])
    }
  }, [policyDetail, editingPolicyId])

  // Reset form states
  const resetForm = () => {
    setTitle("")
    setSlug("")
    setPolicyType("GENERAL")
    setSummary("")
    setEffectiveAt("")
    setDisplayOrder(0)
    setSections([])
    setEditingPolicyId(null)
    setViewingPolicyId(null)
  }

  // Mutation: Create
  const createMutation = useMutation({
    mutationFn: (body: CreatePolicyRequest) => PolicyService.createPolicyDraft({ body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-versions"] })
      toast.success("Tạo bản nháp chính sách thành công")
      setIsAddOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi tạo chính sách nháp")
    }
  })

  // Mutation: Update
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePolicyRequest }) => PolicyService.updatePolicyDraft({ id, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-versions"] })
      toast.success("Cập nhật bản nháp thành công")
      setIsEditOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi cập nhật bản nháp")
    }
  })

  // Mutation: Publish
  const publishMutation = useMutation({
    mutationFn: (id: string) => PolicyService.publishPolicy({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-versions"] })
      toast.success("Đăng tải chính sách thành công")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi đăng tải chính sách")
    }
  })

  // Mutation: Archive
  const archiveMutation = useMutation({
    mutationFn: (id: string) => PolicyService.archivePolicy({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-versions"] })
      toast.success("Lưu trữ chính sách thành công")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Lỗi lưu trữ chính sách")
    }
  })

  // Section handling
  const addSection = () => {
    setSections(prev => [
      ...prev,
      { heading: "", anchor: "", bodyMarkdown: "", orderIndex: prev.length + 1 }
    ])
  }

  const removeSection = (index: number) => {
    setSections(prev => {
      const updated = prev.filter((_, i) => i !== index)
      return updated.map((s, i) => ({ ...s, orderIndex: i + 1 }))
    })
  }

  const updateSectionField = (index: number, field: keyof PolicySectionRequest, value: any) => {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const moveSection = (index: number, direction: "up" | "down") => {
    setSections(prev => {
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev
      const list = [...prev]
      const temp = list[index]
      list[index] = list[targetIndex]
      list[targetIndex] = temp
      return list.map((s, i) => ({ ...s, orderIndex: i + 1 }))
    })
  }

  // Submit create form
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !slug) return
    const body: CreatePolicyRequest = {
      policyType,
      slug,
      title,
      summary: summary || undefined,
      effectiveAt: effectiveAt ? new Date(effectiveAt).toISOString() : undefined,
      displayOrder,
      sections
    }
    createMutation.mutate(body)
  }

  // Submit edit form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPolicyId || !title) return
    const body: UpdatePolicyRequest = {
      policyType,
      title,
      summary: summary || undefined,
      effectiveAt: effectiveAt ? new Date(effectiveAt).toISOString() : undefined,
      displayOrder,
      sections
    }
    updateMutation.mutate({ id: editingPolicyId, body })
  }

  // Badge render helpers
  const getPolicyTypeBadge = (type?: string) => {
    switch (type) {
      case "PRIVACY": return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Quyền riêng tư</Badge>
      case "TERMS": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Điều khoản sử dụng</Badge>
      case "REFUND": return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">Hoàn tiền</Badge>
      case "COOKIE": return <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300">Cookies</Badge>
      default: return <Badge variant="secondary">Tổng quan</Badge>
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "PUBLISHED": return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold">Công khai</Badge>
      case "DRAFT": return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-semibold">Bản nháp</Badge>
      case "ARCHIVED": return <Badge variant="secondary" className="bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300">Lưu trữ</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Table Columns config
  const columns: Column<PolicySummaryResponse>[] = [
    {
      key: "policyType",
      title: "Loại chính sách",
      render: (p) => getPolicyTypeBadge(p.policyType),
    },
    {
      key: "title",
      title: "Tiêu đề",
      render: (p) => <span className="font-semibold text-foreground">{p.title}</span>,
    },
    {
      key: "slug",
      title: "Slug / Đường dẫn",
      render: (p) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.slug}</code>,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (p) => getStatusBadge(p.status),
    },
    {
      key: "versionNumber",
      title: "Phiên bản",
      render: (p) => <span className="font-medium font-mono text-xs">v{p.versionNumber}</span>,
    },
    {
      key: "effectiveAt",
      title: "Hiệu lực từ",
      render: (p) => p.effectiveAt ? new Date(p.effectiveAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "N/A",
    },
    {
      key: "displayOrder",
      title: "Thứ tự",
      render: (p) => <span className="font-mono text-xs">{p.displayOrder ?? 0}</span>,
    },
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setViewingPolicyId(p.id || null); setIsViewOpen(true) }}
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {p.status === "DRAFT" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setEditingPolicyId(p.id || null); setIsEditOpen(true) }}
                title="Sửa bản nháp"
              >
                <Edit2 className="h-4 w-4 text-primary" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => p.id && publishMutation.mutate(p.id)}
                title="Đăng tải"
                className="text-emerald-600 hover:text-emerald-700"
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          )}

          {p.status === "PUBLISHED" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => p.id && archiveMutation.mutate(p.id)}
              title="Lưu trữ"
              className="text-destructive hover:text-destructive/80"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const emptyWrapper: any = {
    success: true,
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý Chính sách</h2>
          <p className="text-sm text-muted-foreground">Xem, quản lý và đăng tải các điều khoản, chính sách pháp lý của hệ thống.</p>
        </div>
        <div>
          <Button onClick={() => { resetForm(); setIsAddOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Thêm chính sách
          </Button>
        </div>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          type="search"
          placeholder="Tìm kiếm chính sách..."
          className="max-w-xs bg-card"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); handlePageChange(1) }}
        />

        <div className="w-56">
          <Select value={filterType} onValueChange={(val) => { setFilterType(val || "ALL"); handlePageChange(1) }}>
            <SelectTrigger className="bg-card w-full">
              <SelectValue placeholder="Loại chính sách" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại chính sách</SelectItem>
              <SelectItem value="PRIVACY">Quyền riêng tư</SelectItem>
              <SelectItem value="TERMS">Điều khoản sử dụng</SelectItem>
              <SelectItem value="COOKIE">Chính sách Cookie</SelectItem>
              <SelectItem value="GENERAL">Chính sách chung</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-56">
          <Select value={filterStatus} onValueChange={(val) => { setFilterStatus(val || "ALL"); handlePageChange(1) }}>
            <SelectTrigger className="bg-card w-full">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="PUBLISHED">Công khai</SelectItem>
              <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTableWrapper
        columns={columns}
        data={data ?? emptyWrapper}
        isLoading={isLoading}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortConfig={sortConfig}
        onSort={handleSort}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        emptyMessage="Không tìm thấy chính sách nào tương ứng."
      />

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsViewOpen(open) }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl">
          {isLoadingDetail ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Đang tải chi tiết chính sách...</div>
          ) : (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {getPolicyTypeBadge(policyDetail?.data?.policyType)}
                  {getStatusBadge(policyDetail?.data?.status)}
                  <span className="text-xs text-muted-foreground">Phiên bản v{policyDetail?.data?.versionNumber}</span>
                </div>
                <DialogTitle className="text-xl font-bold">{policyDetail?.data?.title}</DialogTitle>
                <DialogDescription>
                  Slug: <code className="text-xs bg-muted px-1 rounded">{policyDetail?.data?.slug}</code>
                  {policyDetail?.data?.effectiveAt && ` | Hiệu lực từ: ${new Date(policyDetail.data.effectiveAt).toLocaleString("vi-VN")}`}
                </DialogDescription>
              </DialogHeader>

              {policyDetail?.data?.summary && (
                <div className="p-4 bg-muted/40 rounded-xl border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Tóm tắt chính sách</h4>
                  <p className="text-sm text-foreground leading-relaxed">{policyDetail?.data?.summary}</p>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-bold text-base border-b pb-2">Các phần nội dung ({policyDetail?.data?.sections?.length || 0})</h3>
                {policyDetail?.data?.sections && policyDetail.data.sections.length > 0 ? (
                  <div className="space-y-4">
                    {policyDetail.data.sections
                      .slice()
                      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                      .map((sec, i) => (
                        <div key={sec.id || i} className="p-4 bg-card rounded-xl border border-border/80 shadow-sm space-y-2">
                          <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {sec.orderIndex}
                            </span>
                            {sec.heading}
                          </h4>
                          {sec.anchor && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              Anchor: #{sec.anchor}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted/20 p-3 rounded-lg border max-h-48 overflow-y-auto">
                            {sec.bodyMarkdown}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Chính sách này không chứa phần nội dung nào.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Policy Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsAddOpen(open) }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl">
          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Tạo chính sách mới (Bản nháp)</DialogTitle>
              <DialogDescription>Nhập thông tin cơ bản và tạo nội dung bản nháp chính sách pháp lý.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Loại chính sách</label>
                <Select value={policyType} onValueChange={(val: any) => setPolicyType(val)}>
                  <SelectTrigger className="bg-card w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVACY">Quyền riêng tư</SelectItem>
                    <SelectItem value="TERMS">Điều khoản dịch vụ</SelectItem>
                    <SelectItem value="COOKIE">Chính sách Cookie</SelectItem>
                    <SelectItem value="GENERAL">Chính sách chung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold">Đường dẫn tĩnh (Slug)</label>
                <Input
                  placeholder="vi-du: dieu-khoan-su-dung"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold">Tiêu đề</label>
                <Input
                  placeholder="Tiêu đề chính sách..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold">Tóm tắt nội dung</label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Mô tả tóm tắt ngắn gọn về chính sách này..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold">Hiệu lực từ</label>
                <input
                  type="datetime-local"
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={effectiveAt}
                  onChange={(e) => setEffectiveAt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold">Thứ tự hiển thị</label>
                <Input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Sections editor */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-foreground">Các mục nội dung ({sections.length})</h3>
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <PlusCircle className="mr-1.5 h-4 w-4" /> Thêm mục
                </Button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-xl text-xs text-muted-foreground">
                  Chưa có mục nội dung nào. Bấm nút "Thêm mục" để bắt đầu soạn thảo.
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((sec, idx) => (
                    <div key={idx} className="p-4 bg-muted/30 rounded-xl border border-border/80 space-y-3 relative group">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                          Mục {idx + 1} (Thứ tự: {sec.orderIndex})
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveSection(idx, "up")}
                            disabled={idx === 0}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveSection(idx, "down")}
                            disabled={idx === sections.length - 1}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => removeSection(idx)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold">Tiêu đề mục</label>
                          <Input
                            placeholder="Nhập tiêu đề mục (ví dụ: 1. Quyền lợi)"
                            value={sec.heading}
                            onChange={(e) => updateSectionField(idx, "heading", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold">Anchor liên kết (Tự sinh nếu trống)</label>
                          <Input
                            placeholder="vi-du: quyen-loi"
                            value={sec.anchor}
                            onChange={(e) => updateSectionField(idx, "anchor", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-bold">Nội dung (Markdown)</label>
                          <textarea
                            rows={4}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Nhập nội dung dưới dạng markdown..."
                            value={sec.bodyMarkdown}
                            onChange={(e) => updateSectionField(idx, "bodyMarkdown", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Đang tạo nháp..." : "Tạo bản nháp"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsEditOpen(open) }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl">
          {isLoadingDetail ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Đang tải thông tin chỉnh sửa...</div>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa chính sách (Bản nháp)</DialogTitle>
                <DialogDescription>Chỉnh sửa các thuộc tính và mục nội dung cho bản nháp chính sách này.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Loại chính sách</label>
                  <Select value={policyType} onValueChange={(val: any) => setPolicyType(val)}>
                    <SelectTrigger className="bg-card w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIVACY">Quyền riêng tư (PRIVACY)</SelectItem>
                      <SelectItem value="TERMS">Điều khoản dịch vụ (TERMS)</SelectItem>
                      <SelectItem value="COOKIE">Chính sách Cookie (COOKIE)</SelectItem>
                      <SelectItem value="GENERAL">Chính sách chung (GENERAL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold">Đường dẫn tĩnh (Slug) - Không thể đổi</label>
                  <Input value={slug} disabled className="opacity-70 cursor-not-allowed bg-muted" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold">Tiêu đề</label>
                  <Input
                    placeholder="Tiêu đề chính sách..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold">Tóm tắt nội dung</label>
                  <textarea
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Mô tả tóm tắt ngắn gọn về chính sách này..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold">Hiệu lực từ</label>
                  <input
                    type="datetime-local"
                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={effectiveAt}
                    onChange={(e) => setEffectiveAt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold">Thứ tự hiển thị</label>
                  <Input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Sections editor */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-foreground">Các mục nội dung ({sections.length})</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addSection}>
                    <PlusCircle className="mr-1.5 h-4 w-4" /> Thêm mục
                  </Button>
                </div>

                {sections.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-xl text-xs text-muted-foreground">
                    Chưa có mục nội dung nào. Bấm nút "Thêm mục" để bắt đầu soạn thảo.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections.map((sec, idx) => (
                      <div key={idx} className="p-4 bg-muted/30 rounded-xl border border-border/80 space-y-3 relative group">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                            Mục {idx + 1} (Thứ tự: {sec.orderIndex})
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveSection(idx, "up")}
                              disabled={idx === 0}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => moveSection(idx, "down")}
                              disabled={idx === sections.length - 1}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => removeSection(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold">Tiêu đề mục</label>
                            <Input
                              placeholder="Nhập tiêu đề mục (ví dụ: 1. Quyền lợi)"
                              value={sec.heading}
                              onChange={(e) => updateSectionField(idx, "heading", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold">Anchor liên kết (Tự sinh nếu trống)</label>
                            <Input
                              placeholder="vi-du: quyen-loi"
                              value={sec.anchor}
                              onChange={(e) => updateSectionField(idx, "anchor", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-bold">Nội dung (Markdown)</label>
                            <textarea
                              rows={4}
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              placeholder="Nhập nội dung dưới dạng markdown..."
                              value={sec.bodyMarkdown}
                              onChange={(e) => updateSectionField(idx, "bodyMarkdown", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật bản nháp"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
