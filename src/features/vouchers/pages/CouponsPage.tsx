import * as React from "react"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { VoucherService } from "@/services"
import type { VoucherResponse, PaginatedApiResponse } from "@/types"
import { DateTimePicker } from "@/components/ui/date-time-picker"

const formatPrice = (price: number | undefined) =>
  price === undefined ? "0 ₫" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

const formatDate = (d: string | undefined) =>
  d ? new Date(d).toLocaleDateString("vi-VN") : ""

const BASE_COLUMNS: Column<VoucherResponse>[] = [
  { key: "code", title: "Mã Code", sortable: true, render: (v) => <span className="font-mono font-medium">{v.code}</span> },
  { key: "discountAmount", title: "Mức giảm", render: (v) => formatPrice(v.discountAmount as any) },
  { key: "quantity", title: "Số lượng", hideable: true, render: (v) => <span>{v.quantity ?? "∞"}</span> },
  { key: "validFrom", title: "Từ ngày", hideable: true, render: (v) => formatDate(v.validFrom as any) },
  { key: "validTo", title: "Đến ngày", render: (v) => formatDate(v.validTo as any) },
  { key: "actions", title: "Hành động", className: "text-right", render: () => null },
]

export function CouponsPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingVoucher, setEditingVoucher] = React.useState<VoucherResponse | null>(null)

  // Form state for add
  const [code, setCode] = React.useState("")
  const [discountAmount, setDiscountAmount] = React.useState("")
  const [validFrom, setValidFrom] = React.useState("")
  const [validTo, setValidTo] = React.useState("")
  const [quantity, setQuantity] = React.useState("")

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange
  } = useTableState(BASE_COLUMNS)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  const { data, isLoading } = useQuery({
    queryKey: ["vouchers", page, pageSize, debouncedSearch],
    queryFn: () => VoucherService.getVouchers({ page, size: pageSize, query: debouncedSearch || undefined }),
  })

  const addMutation = useMutation({
    mutationFn: (req: any) => VoucherService.createVoucher({ body: req }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] })
      setIsAddOpen(false)
      setCode(""); setDiscountAmount(""); setValidFrom(""); setValidTo(""); setQuantity("")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: string; req: any }) =>
      VoucherService.updateVoucher({ id, body: req }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] })
      setIsEditOpen(false)
      setEditingVoucher(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => VoucherService.deleteVoucher({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vouchers"] }),
  })

  const paginatedData: PaginatedApiResponse<VoucherResponse> = data || {
    success: true,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }


  const columns: Column<VoucherResponse>[] = [
    ...BASE_COLUMNS.slice(0, 5),
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (v) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditingVoucher(v); setIsEditOpen(true) }}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => v.id && deleteMutation.mutate(v.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Mã giảm giá</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button><Plus className="mr-2 h-4 w-4" /> Thêm mã mới</Button>} />
          <DialogContent>
            <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate({ code, discountAmount: Number(discountAmount), minPurchaseAmount: 0, maxDiscountAmount: Number(discountAmount), quantity: Number(quantity) || 100, validFrom: validFrom ? new Date(validFrom).toISOString() : undefined, validTo: validTo ? new Date(validTo).toISOString() : undefined }) }}>
              <DialogHeader>
                <DialogTitle>Thêm mã giảm giá</DialogTitle>
                <DialogDescription>Tạo mã giảm giá mới cho hệ thống.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mã code</label>
                  <Input placeholder="VD: SUMMER20" value={code} onChange={e => setCode(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mức giảm (VND)</label>
                  <Input type="number" placeholder="VD: 50000" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số lượng</label>
                  <Input type="number" min={1} placeholder="VD: 100" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hiệu lực từ</label>
                    <DateTimePicker value={validFrom} onChange={setValidFrom} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hết hạn</label>
                    <DateTimePicker value={validTo} onChange={setValidTo} />
                  </div>
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
        emptyMessage="Không có mã giảm giá nào."
        toolbarContent={
          <Input
            type="search"
            placeholder="Tìm kiếm mã giảm giá..."
            className="max-w-sm"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); handlePageChange(1) }}
          />
        }
      />

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={(e) => { e.preventDefault(); if (editingVoucher?.id) updateMutation.mutate({ id: editingVoucher.id, req: { code: editingVoucher.code, discountAmount: Number(editingVoucher.discountAmount), quantity: Number(editingVoucher.quantity), validFrom: editingVoucher.validFrom ? new Date(editingVoucher.validFrom).toISOString() : undefined, validTo: editingVoucher.validTo ? new Date(editingVoucher.validTo).toISOString() : undefined } }) }}>
            <DialogHeader>
              <DialogTitle>Sửa mã giảm giá</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mã code</label>
                <Input
                  value={editingVoucher?.code || ""}
                  onChange={e => setEditingVoucher(prev => prev ? { ...prev, code: e.target.value } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mức giảm (VND)</label>
                <Input
                  type="number"
                  value={editingVoucher?.discountAmount || ""}
                  onChange={e => setEditingVoucher(prev => prev ? { ...prev, discountAmount: Number(e.target.value) } : null)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Số lượng</label>
                <Input
                  type="number"
                  min={1}
                  value={editingVoucher?.quantity || ""}
                  onChange={e => setEditingVoucher(prev => prev ? { ...prev, quantity: Number(e.target.value) } : null)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hiệu lực từ</label>
                  <DateTimePicker
                    value={editingVoucher?.validFrom || ""}
                    onChange={val => setEditingVoucher(prev => prev ? { ...prev, validFrom: val } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hết hạn</label>
                  <DateTimePicker
                    value={editingVoucher?.validTo || ""}
                    onChange={val => setEditingVoucher(prev => prev ? { ...prev, validTo: val } : null)}
                  />
                </div>
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

