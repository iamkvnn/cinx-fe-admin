/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft, PlayCircle, Clock, Star,
  Users, GitCompare, PlusCircle, MinusCircle, Edit, ArrowRight,
  FileText, HelpCircle, ClipboardList
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AdminCourseService, CourseService } from "@/services"
import { CourseApprovalActions } from "../components/CourseApprovalActions"
import { StatusBadge, getCourseDisplayStatus } from "../components/StatusBadge"

// Helper to get unique IDs from two arrays of objects
const getUniqueIds = (arr1?: any[], arr2?: any[]) => {
  const ids = new Set<string>()
  arr1?.forEach(item => ids.add(item.id))
  arr2?.forEach(item => ids.add(item.id))
  return Array.from(ids)
}

export function CourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDiff, setShowDiff] = React.useState(false)

  // 1. DRAFT COURSE INFO (Current/Latest)
  const { data: draftCourseData, isLoading: isLoadingDraft } = useQuery({
    queryKey: ['course-admin', id],
    queryFn: () => CourseService.getEditableCourseDraft({ id: id as string }, { skipToast: true }),
    enabled: !!id
  })

  // 2. PUBLISHED COURSE INFO (Old)
  const { data: publishedCourseData } = useQuery({
    queryKey: ['course-published', id],
    queryFn: async () => {
      try {
        return await CourseService.getReadableCourseById({ id: id as string }, { skipToast: true })
      } catch (e: any) {
        if (e?.response?.status === 404) return null
        throw e
      }
    },
    enabled: !!id,
    retry: false
  })

  // 3. DRAFT CURRICULUM
  const { data: draftCurriculumData } = useQuery({
    queryKey: ['course-curriculum-draft', id],
    queryFn: async () => {
      try {
        const res = await CourseService.getEditableDraftCurriculum({ id: id as string }, { skipToast: true })
        return res
      } catch (e: any) {
        if (e?.response?.status === 404) return { data: { sections: [] } }
        throw e
      }
    },
    enabled: !!id
  })

  // 4. PUBLISHED CURRICULUM
  const { data: publishedCurriculumData } = useQuery({
    queryKey: ['course-curriculum-published', id],
    queryFn: async () => {
      try {
        return await CourseService.getReadableCurriculum({ id: id as string }, { skipToast: true })
      } catch (e: any) {
        if (e?.response?.status === 404) return null
        throw e
      }
    },
    enabled: !!id,
    retry: false
  })

  const approveMutation = useMutation({
    mutationFn: (courseId: string) => AdminCourseService.approveCourse({ id: courseId }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate('/courses')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ courseId, reason }: { courseId: string, reason: string }) =>
      AdminCourseService.rejectCourse({ id: courseId, body: { reason } }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate('/courses')
    }
  })

  if (isLoadingDraft) return <div className="p-8 text-center">Đang tải...</div>

  // Base data is the Draft
  const course = draftCourseData?.data
  if (!course) return <div className="p-8 text-center">Không tìm thấy khóa học</div>

  const publishedCourse = publishedCourseData?.data || null
  const draftCurriculum = draftCurriculumData?.data?.sections || []
  const publishedCurriculum = (publishedCurriculumData as any)?.data?.sections || []

  // Derived state to know if this is an update vs new
  // If the status is WAITING_APPROVAL and we DO have a published version -> it's an Update!
  const isUpdate = course.publishStatus === 'WAITING_APPROVAL' && publishedCourse !== null

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return '0 phút'
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hours > 0 && mins > 0) return `${hours} giờ ${mins} phút`
    if (hours > 0) return `${hours} giờ`
    return `${mins} phút`
  }

  const getLessonIcon = (type?: string) => {
    switch (type) {
      case "VIDEO": return <PlayCircle className="h-4 w-4 shrink-0 text-primary" />;
      case "ARTICLE": return <FileText className="h-4 w-4 shrink-0 text-primary" />;
      case "QUIZ": return <HelpCircle className="h-4 w-4 shrink-0 text-primary" />;
      case "ASSIGNMENT": return <ClipboardList className="h-4 w-4 shrink-0 text-primary" />;
      default: return <PlayCircle className="h-4 w-4 shrink-0 text-primary" />;
    }
  }

  const renderLessonDiff = (oldL: any, newL: any) => {
    if (!oldL && newL) {
      return (
        <div key={newL.id || 'new'} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/50 mt-2">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-green-700 dark:text-green-400 text-sm font-medium">Thêm bài mới: {newL.title}</span>
          </div>
          <span className="text-green-600 text-xs">{formatDuration(newL.duration)}</span>
        </div>
      )
    }
    if (oldL && !newL) {
      return (
        <div key={oldL.id || 'old'} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 mt-2">
          <div className="flex items-center gap-2">
            <MinusCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-red-700 dark:text-red-400 text-sm font-medium line-through">Xóa bài: {oldL.title}</span>
          </div>
        </div>
      )
    }

    const titleChanged = (oldL.title || '').trim() !== (newL.title || '').trim();
    const durationChanged = Number(oldL.duration ?? 0) !== Number(newL.duration ?? 0);
    const orderChanged = oldL.orderIndex !== undefined && newL.orderIndex !== undefined && Number(oldL.orderIndex) !== Number(newL.orderIndex);

    if (!titleChanged && !durationChanged && !orderChanged) {
      return (
        <div key={newL.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md bg-muted/20 border border-transparent mt-2">
          <span className="text-muted-foreground text-sm flex items-center gap-2">
            {getLessonIcon(newL.lessonType)} {newL.title}
          </span>
          <span className="text-muted-foreground text-xs">{formatDuration(newL.duration)}</span>
        </div>
      )
    }

    return (
      <div key={newL.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-md bg-blue-50/30 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 mt-2">
        <div className="flex items-start sm:items-center gap-2">
          <Edit className="w-4 h-4 text-blue-500 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-sm">
            {titleChanged ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="line-through text-muted-foreground">{oldL.title}</span>
                <ArrowRight className="w-3 h-3 text-blue-500" />
                <span className="text-blue-700 dark:text-blue-400 font-medium">{newL.title}</span>
              </div>
            ) : (
              <span className="text-blue-700 dark:text-blue-400 font-medium">{newL.title}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs ml-6 sm:ml-0">
          {orderChanged && (
            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
              Thứ tự: #{oldL.orderIndex ?? 0} → #{newL.orderIndex ?? 0}
            </span>
          )}
          {durationChanged && (
            <div className="text-xs flex items-center gap-1">
              <span className="line-through text-muted-foreground">{formatDuration(oldL.duration)}</span>
              <ArrowRight className="w-3 h-3 text-blue-500" />
              <span className="text-blue-600 font-medium">{formatDuration(newL.duration)}</span>
            </div>
          )}
          {!durationChanged && (
            <span className="text-muted-foreground">{formatDuration(newL.duration)}</span>
          )}
        </div>
      </div>
    )
  }

  const renderSectionDiff = (oldSec: any, newSec: any) => {
    if (!oldSec && newSec) {
      return (
        <div key={newSec.id || 'new_sec'} className="p-4 bg-green-50/30 dark:bg-green-900/10 border-l-4 border-l-green-500 rounded-r-md">
          <div className="flex items-start gap-3">
            <PlusCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div className="w-full space-y-3">
              <div>
                <h4 className="font-semibold text-green-700 dark:text-green-400">Thêm phần mới: {newSec.title}</h4>
                {newSec.description && <p className="text-sm text-green-600/80 mt-1">{newSec.description}</p>}
              </div>
              <div className="space-y-2 border-l-2 border-green-200 dark:border-green-800 pl-4 ml-1 mt-2">
                {newSec.lessons?.map((l: any) => renderLessonDiff(null, l))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (oldSec && !newSec) {
      return (
        <div key={oldSec.id || 'old_sec'} className="p-4 bg-red-50/30 dark:bg-red-900/10 border-l-4 border-l-red-500 rounded-r-md">
          <div className="flex items-start gap-3">
            <MinusCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 line-through">Đã xóa: {oldSec.title}</h4>
            </div>
          </div>
        </div>
      )
    }

    const titleChanged = (oldSec.title || '').trim() !== (newSec.title || '').trim();
    const descChanged = (oldSec.description || '').trim() !== (newSec.description || '').trim();
    const orderChanged = oldSec.orderIndex !== undefined && newSec.orderIndex !== undefined && Number(oldSec.orderIndex) !== Number(newSec.orderIndex);
    const lessonIds = getUniqueIds(oldSec.lessons, newSec.lessons);

    // Sort lessonIds by new sequence
    const sortedLessonIds = [...lessonIds].sort((a, b) => {
      const idxA = newSec.lessons?.findIndex((l: any) => l.id === a) ?? -1;
      const idxB = newSec.lessons?.findIndex((l: any) => l.id === b) ?? -1;
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const oldIdxA = oldSec.lessons?.findIndex((l: any) => l.id === a) ?? -1;
      const oldIdxB = oldSec.lessons?.findIndex((l: any) => l.id === b) ?? -1;
      return oldIdxA - oldIdxB;
    });

    const hasLessonChanges = lessonIds.some(lId => {
      const oL = oldSec.lessons?.find((l: any) => l.id === lId);
      const nL = newSec.lessons?.find((l: any) => l.id === lId);
      return !oL || !nL ||
        (oL.title || '').trim() !== (nL.title || '').trim() ||
        Number(oL.duration ?? 0) !== Number(nL.duration ?? 0) ||
        (oL.orderIndex !== undefined && nL.orderIndex !== undefined && Number(oL.orderIndex) !== Number(nL.orderIndex));
    });

    const isModified = titleChanged || descChanged || orderChanged || hasLessonChanges;

    return (
      <div key={newSec.id} className={`p-4 bg-card rounded-r-md border-y border-r ${isModified ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}>
        <div className="flex items-start gap-3">
          {isModified ? (
            <Edit className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          ) : (
            <div className="w-5 h-5 mt-0.5 shrink-0" />
          )}
          <div className="w-full space-y-4">
            <div>
              {titleChanged ? (
                <h4 className="font-semibold flex items-center gap-2 flex-wrap">
                  <span className="line-through text-muted-foreground">{oldSec.title}</span>
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-700 dark:text-blue-400">{newSec.title}</span>
                  {orderChanged && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-normal">
                      Thứ tự phần: #{oldSec.orderIndex ?? 0} → #{newSec.orderIndex ?? 0}
                    </span>
                  )}
                </h4>
              ) : (
                <h4 className="font-semibold flex items-center gap-2 flex-wrap">
                  <span>{newSec.title}</span>
                  {orderChanged && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-normal">
                      Thứ tự phần: #{oldSec.orderIndex ?? 0} → #{newSec.orderIndex ?? 0}
                    </span>
                  )}
                </h4>
              )}
              {descChanged && (
                <div className="text-sm mt-2 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-900/50">
                  <span className="line-through text-muted-foreground block mb-1">{oldSec.description}</span>
                  <span className="text-blue-700 dark:text-blue-400 block">{newSec.description}</span>
                </div>
              )}
            </div>

            <div className="space-y-0 border-l-2 border-muted pl-4 ml-1">
              {sortedLessonIds.map(lId => renderLessonDiff(
                oldSec.lessons?.find((l: any) => l.id === lId),
                newSec.lessons?.find((l: any) => l.id === lId)
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // A reusable component to render the course details based on provided data
  const renderCourseInfo = (data: any, sections: any[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="mb-2">
                  <StatusBadge status={getCourseDisplayStatus(data)} />
                </div>
                <CardTitle className="text-2xl">{data.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {(data.images && data.images.length > 0) && (
              <div className="aspect-video w-full rounded-md overflow-hidden bg-muted border">
                <img
                  src={data.images[0]?.imageUrl}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg mb-2">Mô tả khóa học</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {data.description || "Chưa có mô tả"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chương trình giảng dạy</CardTitle>
            <CardDescription>
              Gồm {sections?.length || 0} phần • {sections?.reduce((acc: number, sec: any) => acc + (sec.lessons?.length || 0), 0) || 0} bài học • Tổng thời lượng {formatDuration(data.duration)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion multiple className="w-full space-y-4">
              {sections?.map((section: any) => (
                <AccordionItem key={section.id} value={section.id} className="border rounded-md px-4 bg-muted/30">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col items-start text-left w-full gap-1">
                      <span className="font-semibold">{section.title}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {section.lessons?.length || 0} bài giảng • {formatDuration(section.duration)}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <ul className="space-y-2 mt-2">
                      {section.lessons?.map((lesson: any) => (
                        <li key={lesson.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 text-sm border bg-background">
                          <div className="flex items-center gap-3">
                            {getLessonIcon(lesson.lessonType)}
                            <span>{lesson.title}</span>
                            {lesson.isPreview && (
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-2">Preview</Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {formatDuration(lesson.duration)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin Giảng viên</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-muted shrink-0">
              {data.instructor?.avatarUrl ? (
                <img src={data.instructor.avatarUrl} alt={data.instructor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  {data.instructor?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold">{data.instructor?.name}</h4>
              <p className="text-sm text-muted-foreground">{data.instructor?.email}</p>
              <div className="text-xs text-muted-foreground mt-1">Giới tính: {data.instructor?.gender === 'MALE' ? 'Nam' : 'Nữ'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chi tiết & Thông số</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Giá gốc:</span>
              <span className="font-semibold line-through text-muted-foreground">{formatPrice(data.price)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Giá bán:</span>
              <span className="font-bold text-primary text-lg">{formatPrice(data.discountedPrice !== undefined ? data.discountedPrice : data.price)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Giảm giá:</span>
              <Badge variant="destructive">{data.discountRate || 0}%</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Danh mục:</span>
              <Badge variant="outline">{data.category?.name}</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4" /> Đánh giá:</span>
              <span className="font-medium">{data.rating || 0}/5.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Học viên:</span>
              <span className="font-medium">{data.enrollmentCount || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Chứng chỉ:</span>
              <span className="font-medium">{data.hasCertificate ? 'Có cấp chứng chỉ' : 'Không có'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Gói Subscription:</span>
              <Badge variant={data.isInSubscription ? "default" : "secondary"} className={data.isInSubscription ? "bg-green-500 hover:bg-green-600" : ""}>
                {data.isInSubscription ? 'Có áp dụng' : 'Không áp dụng'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const rawSectionIds = getUniqueIds(publishedCurriculum, draftCurriculum)
  const sectionIds = [...rawSectionIds].sort((a, b) => {
    const idxA = draftCurriculum?.findIndex((s: any) => s.id === a) ?? -1
    const idxB = draftCurriculum?.findIndex((s: any) => s.id === b) ?? -1
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    const oldIdxA = publishedCurriculum?.findIndex((s: any) => s.id === a) ?? -1
    const oldIdxB = publishedCurriculum?.findIndex((s: any) => s.id === b) ?? -1
    return oldIdxA - oldIdxB
  })

  const isTitleChanged = publishedCourse?.title !== course.title
  const isPriceChanged = Number(publishedCourse?.price ?? 0) !== Number(course.price ?? 0)

  const oldDiscountedPrice = publishedCourse?.discountedPrice !== undefined ? publishedCourse.discountedPrice : (publishedCourse?.price || 0)
  const newDiscountedPrice = course.discountedPrice !== undefined ? course.discountedPrice : (course.price || 0)
  const isDiscountedPriceChanged = Number(oldDiscountedPrice) !== Number(newDiscountedPrice)

  const isDurationChanged = Number(publishedCourse?.duration ?? 0) !== Number(course.duration ?? 0)
  const isDescriptionChanged = (publishedCourse?.description || '') !== (course.description || '')

  const isCategoryChanged = publishedCourse?.category?.id !== course.category?.id
  const isCertificateChanged = publishedCourse?.hasCertificate !== course.hasCertificate || publishedCourse?.certificateTitle !== course.certificateTitle
  const isSubscriptionChanged = publishedCourse?.isInSubscription !== course.isInSubscription

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-md border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/courses')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Chi tiết Khóa học</h2>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              Mã KH: <span className="font-mono text-foreground">{id?.substring(0, 8)}...</span>
              <span>•</span>
              Ngày cập nhật: {new Date(course.updatedAt || course.createdAt || "").toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {course.publishStatus === 'WAITING_APPROVAL' && (
          <div className="flex gap-2">
            <CourseApprovalActions
              courseId={id as string}
              instructorName={course.instructor?.name}
              approvePending={approveMutation.isPending}
              rejectPending={rejectMutation.isPending}
              onApprove={() => approveMutation.mutate(id as string)}
              onReject={(reason) => rejectMutation.mutate({ courseId: id as string, reason })}
            />
          </div>
        )}
      </div>

      {isUpdate ? (
        <Tabs defaultValue="update" className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto grid grid-cols-2 group-data-horizontal/tabs:h-12">
            <TabsTrigger value="current" className="py-2">Thông tin</TabsTrigger>
            <TabsTrigger value="update" className="py-2 relative">
              Bản cập nhật
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-0 outline-none">
            {renderCourseInfo(publishedCourse, publishedCurriculum)}
          </TabsContent>

          <TabsContent value="update" className="mt-0 outline-none">
            <div className="flex justify-end mb-4">
              <div className="flex items-center space-x-3 bg-card px-4 py-2 rounded-md border shadow-sm">
                <Label htmlFor="compare-mode" className="text-sm font-medium cursor-pointer flex items-center text-muted-foreground">
                  <GitCompare className="w-4 h-4 inline-block mr-2" />
                  So sánh thay đổi
                </Label>
                <Switch
                  id="compare-mode"
                  checked={showDiff}
                  onCheckedChange={setShowDiff}
                />
              </div>
            </div>

            {showDiff ? (
              <div className="space-y-6">
                <Card className="border-blue-100 dark:border-blue-900/50 shadow-sm">
                  <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-lg">
                      <GitCompare className="h-5 w-5" />
                      Thông tin chung
                    </CardTitle>
                    <CardDescription>
                      Các thay đổi về tên khóa học, giá bán, thời lượng và mô tả.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-50 font-semibold py-4">Trường thông tin</TableHead>
                          <TableHead className="w-[40%] font-semibold py-4">Bản hiện tại (Đã xuất bản)</TableHead>
                          <TableHead className="w-[40%] font-semibold py-4">Bản cập nhật (Đang xét duyệt)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium align-top py-4">Tên khóa học</TableCell>
                          <TableCell className={`align-top py-4 ${isTitleChanged ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>{publishedCourse?.title}</TableCell>
                          <TableCell className={`align-top py-4 ${isTitleChanged ? 'text-green-600 font-medium bg-green-50/30 dark:bg-green-900/10' : 'text-muted-foreground'}`}>{course.title}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium align-top py-4">Giá gốc</TableCell>
                          <TableCell className={`align-top py-4 ${isPriceChanged ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>{formatPrice(publishedCourse?.price || 0)}</TableCell>
                          <TableCell className={`align-top py-4 ${isPriceChanged ? 'text-green-600 font-medium bg-green-50/30 dark:bg-green-900/10' : 'text-muted-foreground'}`}>{formatPrice(course.price)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium align-top py-4">Giá bán</TableCell>
                          <TableCell className={`align-top py-4 ${isDiscountedPriceChanged ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>{formatPrice(publishedCourse?.discountedPrice !== undefined ? publishedCourse?.discountedPrice : publishedCourse?.price || 0)}</TableCell>
                          <TableCell className={`align-top py-4 ${isDiscountedPriceChanged ? 'text-green-600 font-medium bg-green-50/30 dark:bg-green-900/10' : 'text-muted-foreground'}`}>{formatPrice(course.discountedPrice !== undefined ? course.discountedPrice : course.price)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium align-top py-4">Danh mục</TableCell>
                          <TableCell className={`align-top py-4 ${isCategoryChanged ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>{publishedCourse?.category?.name || "N/A"}</TableCell>
                          <TableCell className={`align-top py-4 ${isCategoryChanged ? 'text-green-600 font-medium bg-green-50/30 dark:bg-green-900/10' : 'text-muted-foreground'}`}>{course.category?.name || "N/A"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium align-top py-4">Tổng thời lượng</TableCell>
                          <TableCell className={`align-top py-4 ${isDurationChanged ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>{formatDuration(publishedCourse?.duration || 0)}</TableCell>
                          <TableCell className={`align-top py-4 ${isDurationChanged ? 'text-green-600 font-medium bg-green-50/30 dark:bg-green-900/10' : 'text-muted-foreground'}`}>{formatDuration(course.duration)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium align-top py-4">Chứng chỉ</TableCell>
                          <TableCell className={`align-top py-4 ${isCertificateChanged ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                            {publishedCourse?.hasCertificate ? `Có (${publishedCourse.certificateTitle || "Chưa đặt tên"})` : "Không"}
                          </TableCell>
                          <TableCell className={`align-top py-4 ${isCertificateChanged ? 'text-green-600 font-medium bg-green-50/30 dark:bg-green-900/10' : 'text-muted-foreground'}`}>
                            {course.hasCertificate ? `Có (${course.certificateTitle || "Chưa đặt tên"})` : "Không"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium align-top py-4">Gói Subscription</TableCell>
                          <TableCell className={`align-top py-4 ${isSubscriptionChanged ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>
                            {publishedCourse?.isInSubscription ? "Có áp dụng" : "Không áp dụng"}
                          </TableCell>
                          <TableCell className={`align-top py-4 ${isSubscriptionChanged ? 'text-green-600 font-medium bg-green-50/30 dark:bg-green-900/10' : 'text-muted-foreground'}`}>
                            {course.isInSubscription ? "Có áp dụng" : "Không áp dụng"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium align-top py-4">Mô tả</TableCell>
                          <TableCell className={`text-sm whitespace-pre-wrap align-top py-4 ${isDescriptionChanged ? 'text-muted-foreground line-through' : 'text-muted-foreground'}`}>{publishedCourse?.description}</TableCell>
                          <TableCell className={`text-sm whitespace-pre-wrap align-top py-4 ${isDescriptionChanged ? 'text-green-600 font-medium bg-green-50/30 dark:bg-green-900/10' : 'text-muted-foreground'}`}>{course.description}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card className="border-blue-100 dark:border-blue-900/50 shadow-sm">
                  <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-lg">
                      <PlayCircle className="h-5 w-5" />
                      Chương trình giảng dạy
                    </CardTitle>
                    <CardDescription>
                      Chi tiết thêm, xóa, sửa các phần học (Sections) và bài giảng (Lessons) bên trong.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {sectionIds.map(secId => renderSectionDiff(
                      publishedCurriculum?.find((s: any) => s.id === secId),
                      draftCurriculum?.find((s: any) => s.id === secId)
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              // When diff is toggled OFF, show the NEW info normally
              renderCourseInfo(course, draftCurriculum)
            )}
          </TabsContent>
        </Tabs>
      ) : (
        renderCourseInfo(course, draftCurriculum)
      )}
    </div>
  )
}
