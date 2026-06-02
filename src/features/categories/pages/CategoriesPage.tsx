import * as React from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { CategoryService } from "@/services"
import type { CategoryResponse, PaginatedApiResponse } from "@/types"

const COLUMNS: Column<CategoryResponse>[] = [
  { key: "id", title: "ID", hideable: true, render: (c) => <span className="font-mono text-xs text-muted-foreground">{c.id?.substring(0, 8)}...</span> },
  { key: "name", title: "Tên danh mục", sortable: true },
  {
    key: "actions",
    title: "Hành động",
    className: "text-right",
    render: () => null, // được override bên dưới per-row
  },
]

export function CategoriesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [newCategoryName, setNewCategoryName] = React.useState("")
  const [editingCategory, setEditingCategory] = React.useState<CategoryResponse | null>(null)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange
  } = useTableState(COLUMNS)

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.getAllCategories(),
  })

  const addMutation = useMutation({
    mutationFn: (name: string) =>
      CategoryService.createCategory({ body: { name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsAddOpen(false)
      setNewCategoryName("")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      CategoryService.updateCategory({ id, body: { name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsEditOpen(false)
      setEditingCategory(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (_id: string) => {
      alert("Delete category API not available yet.")
    },
  })

  // Client-side search + pagination on flat list
  const allCategories: CategoryResponse[] = (data?.data as any) ?? []
  const filtered = React.useMemo(
    () =>
      allCategories.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.id?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [allCategories, searchTerm]
  )

  // Client-side paging
  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const paginatedData: PaginatedApiResponse<CategoryResponse> = {
    success: true,
    message: "",
    data: paged,
    meta: {
      page,
      limit: pageSize,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    }
  }


  // Columns with action renderer
  const columns: Column<CategoryResponse>[] = [
    ...COLUMNS.slice(0, 2),
    { key: "courseCount", title: "Số khóa học", render: () => <span className="text-muted-foreground">N/A</span> },
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (cat) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(cat); setIsEditOpen(true) }}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => cat.id && deleteMutation.mutate(cat.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Danh mục</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Thêm danh mục</Button>} />
          <DialogContent>
            <form onSubmit={(e) => { e.preventDefault(); if (newCategoryName.trim()) addMutation.mutate(newCategoryName.trim()) }}>
              <DialogHeader>
                <DialogTitle>Thêm danh mục mới</DialogTitle>
                <DialogDescription>Tạo một danh mục mới cho hệ thống khóa học.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên danh mục</label>
                  <Input placeholder="Nhập tên danh mục..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Đang lưu..." : "Lưu lại"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
        emptyMessage="Không có danh mục nào."
        toolbarContent={
          <Input
            type="search"
            placeholder="Tìm kiếm danh mục..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); handlePageChange(1) }}
          />
        }
      />

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={(e) => { e.preventDefault(); if (editingCategory?.id && editingCategory.name?.trim()) updateMutation.mutate({ id: editingCategory.id, name: editingCategory.name.trim() }) }}>
            <DialogHeader>
              <DialogTitle>Sửa danh mục</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên danh mục</label>
                <Input
                  value={editingCategory?.name || ""}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
