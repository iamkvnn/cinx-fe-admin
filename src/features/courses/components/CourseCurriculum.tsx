import { PlayCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CourseCurriculumProps {
  sections: any[]
}

const formatDuration = (minutes: number | undefined) => {
  if (!minutes) return '0 phút'
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  if (hours > 0 && mins > 0) return `${hours} giờ ${mins} phút`
  if (hours > 0) return `${hours} giờ`
  return `${mins} phút`
}

export function CourseCurriculum({ sections }: CourseCurriculumProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chương trình giảng dạy</CardTitle>
        <CardDescription>Gồm {sections.length} phần</CardDescription>
      </CardHeader>
      <CardContent>
        {sections.length > 0 ? (
          <Accordion multiple className="w-full space-y-4">
            {sections.map((section: any) => (
              <AccordionItem key={section.id} value={section.id} className="border rounded-md px-4 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-semibold">{section.title}</span>
                    <span className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {section.lessons?.length || 0} bài giảng
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <ul className="space-y-2 mt-2">
                    {section.lessons?.map((lesson: any) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 text-sm border bg-background"
                      >
                        <div className="flex items-center gap-3">
                          <PlayCircle className="h-4 w-4 text-primary" />
                          <span>{lesson.title}</span>
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
        ) : (
          <div className="text-sm text-muted-foreground">Chưa có nội dung.</div>
        )}
      </CardContent>
    </Card>
  )
}
