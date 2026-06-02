import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CourseInstructorCardProps {
  instructor?: {
    avatarUrl?: string
    name?: string
    email?: string
  }
}

export function CourseInstructorCard({ instructor }: CourseInstructorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Thông tin Giảng viên</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {instructor?.avatarUrl ? (
            <img
              src={instructor.avatarUrl}
              alt={instructor.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
              {instructor?.name?.charAt(0) || "I"}
            </div>
          )}
        </div>
        <div>
          <h4 className="font-semibold">{instructor?.name}</h4>
          <p className="text-sm text-muted-foreground">{instructor?.email}</p>
        </div>
      </CardContent>
    </Card>
  )
}
