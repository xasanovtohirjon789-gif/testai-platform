'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useTestStore, CATEGORY_LABELS } from '@/store/testStore'
import { StatisticsCharts } from './StatisticsCharts'
import { Leaderboard } from './Leaderboard'
import { TestHistory } from './TestHistory'
import { 
  FileText, 
  Plus,
  ArrowRight,
  Target,
  BookOpen,
  Award,
  Flame,
  TrendingUp,
  CheckCircle
} from 'lucide-react'

export function DashboardContent() {
  const { tests, attempts, getStatistics } = useTestStore()
  const stats = getStatistics()
  
  // Get active tests
  const activeTests = tests.filter(t => t.status === 'active')
  
  // Quick stats
  const quickStats = [
    { 
      icon: FileText, 
      label: 'Jami testlar', 
      value: stats.totalTests.toString(), 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      icon: TrendingUp, 
      label: "O'rtacha ball", 
      value: stats.avgScore > 0 ? `${stats.avgScore}%` : '0%', 
      color: 'text-secondary',
      bg: 'bg-secondary/10'
    },
    { 
      icon: Target, 
      label: 'Urinishlar', 
      value: stats.totalAttempts.toString(), 
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    { 
      icon: Flame, 
      label: 'Kun ketma-ket', 
      value: stats.streakDays.toString(), 
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    },
  ]

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Xush kelibsiz! 👋
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-2">
            Bugun yangi test yaratishga tayyormisiz?
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2 text-base px-5 py-3" asChild>
            <a href="/?view=create">
              <Plus className="h-5 w-5" />
              Test yaratish
            </a>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-card border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-3 sm:p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm sm:text-base text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Statistics Charts */}
      <StatisticsCharts />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test History */}
        <div className="lg:col-span-2">
          <TestHistory />
        </div>

        {/* Leaderboard */}
        <Leaderboard />
      </div>

      {/* Active Tests */}
      {activeTests.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                  Faol testlar
                </CardTitle>
                <CardDescription className="text-base">Hozirda ishlash mumkin bo'lgan testlar</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-base" asChild>
                <a href="/?view=tests">
                  Barchasi
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTests.slice(0, 6).map((test) => (
                <div
                  key={test.id}
                  className="p-4 sm:p-5 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer group"
                  onClick={() => window.location.href = `/?view=solve&testId=${test.id}`}
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg sm:text-xl font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {test.name}
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        {CATEGORY_LABELS[test.category]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-base text-muted-foreground mb-4">
                    <span>{test.questions.length} savol</span>
                    <span>{test.timeLimit || test.questions.length * 2} daqiqa</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={test.attempts > 0 ? 100 : 0} 
                      className="flex-1 h-2" 
                    />
                    <span className="text-sm text-muted-foreground">
                      {test.attempts} urinish
                    </span>
                  </div>
                  
                  <Button size="lg" className="w-full mt-4 gap-2 text-base py-3">
                    Boshlash
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Tezkor amallar</CardTitle>
          <CardDescription className="text-base">Tez kirish</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" className="h-auto py-5 sm:py-6 flex-col gap-2 text-base" asChild>
              <a href="/?view=create">
                <Plus className="h-6 w-6 text-primary" />
                <span>Yangi test</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto py-5 sm:py-6 flex-col gap-2 text-base" asChild>
              <a href="/?view=tests">
                <FileText className="h-6 w-6 text-secondary" />
                <span>Testlarim</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto py-5 sm:py-6 flex-col gap-2 text-base" asChild>
              <a href="/?view=profile">
                <Award className="h-6 w-6 text-accent" />
                <span>Natijalar</span>
              </a>
            </Button>
            <Button variant="outline" className="h-auto py-5 sm:py-6 flex-col gap-2 text-base" asChild>
              <a href="/?view=tests&tab=public">
                <BookOpen className="h-6 w-6 text-yellow-500" />
                <span>Ommaviy testlar</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
