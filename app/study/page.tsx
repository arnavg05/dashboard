import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StudyModuleForm } from '@/components/study/StudyModuleForm'
import { SectionList } from '@/components/study/SectionList'
import { ReviewQueue } from '@/components/study/ReviewQueue'
import { FocusTimer } from '@/components/study/FocusTimer'
import { isDueForReview } from '@/lib/spaced-repetition'
import { archiveStudyModule } from '@/actions/study'
import { Archive } from 'lucide-react'

export default async function StudyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const todayStr = new Date().toISOString().split('T')[0]

  const [{ data: modules }, { data: allSections }] = await Promise.all([
    supabase.from('study_modules').select('*').eq('user_id', user!.id).eq('archived', false).order('created_at'),
    supabase.from('study_sections').select('*').eq('user_id', user!.id).order('section_number'),
  ])

  // Build review queue with module names
  const moduleMap = Object.fromEntries((modules ?? []).map((m) => [m.id, m.name]))
  const reviewItems = (allSections ?? [])
    .filter((s) => s.completed && isDueForReview(s.next_review_on))
    .map((s) => ({ ...s, module_name: moduleMap[s.module_id] ?? 'Unknown' }))

  const sectionsByModule = (moduleId: string) =>
    (allSections ?? []).filter((s) => s.module_id === moduleId)

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Study</h1>
        {reviewItems.length > 0 && (
          <Badge variant="destructive">{reviewItems.length} reviews due</Badge>
        )}
      </div>

      <Tabs defaultValue="modules">
        <TabsList className="w-full">
          <TabsTrigger value="modules" className="flex-1">Modules</TabsTrigger>
          <TabsTrigger value="review" className="flex-1">
            Review {reviewItems.length > 0 && `(${reviewItems.length})`}
          </TabsTrigger>
          <TabsTrigger value="focus" className="flex-1">Focus</TabsTrigger>
        </TabsList>

        {/* MODULES */}
        <TabsContent value="modules" className="mt-4 space-y-4">
          {(modules?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No study modules yet — create one below.</p>
          ) : (
            modules!.map((mod) => {
              const sections = sectionsByModule(mod.id)
              const done = sections.filter((s) => s.completed).length
              return (
                <Card key={mod.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{mod.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{done}/{mod.total_sections}</Badge>
                        <form action={archiveStudyModule.bind(null, mod.id)}>
                          <button type="submit" className="text-muted-foreground hover:text-foreground" title="Archive">
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SectionList moduleId={mod.id} sections={sections} />
                  </CardContent>
                </Card>
              )
            })
          )}
          <StudyModuleForm />
        </TabsContent>

        {/* REVIEW */}
        <TabsContent value="review" className="mt-4">
          <ReviewQueue items={reviewItems} />
        </TabsContent>

        {/* FOCUS TIMER */}
        <TabsContent value="focus" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Focus Timer</CardTitle></CardHeader>
            <CardContent className="flex justify-center py-4">
              <FocusTimer modules={modules ?? []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
