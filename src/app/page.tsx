'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useTestStore } from '@/store/testStore'
import { 
  Plus, 
  FileText, 
  BarChart3, 
  Settings, 
  User,
  Home,
  BookOpen,
  Trophy,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Dynamic imports to avoid SSR issues
const DashboardContent = dynamic(
  () => import('@/components/dashboard/DashboardContent').then(mod => ({ default: mod.DashboardContent })), 
  { ssr: false }
)
const TestsList = dynamic(
  () => import('@/components/dashboard/TestsList').then(mod => ({ default: mod.TestsList })), 
  { ssr: false }
)
const TestSolver = dynamic(
  () => import('@/components/dashboard/TestSolver').then(mod => ({ default: mod.TestSolver })), 
  { ssr: false }
)
const TestCreateForm = dynamic(
  () => import('@/components/test-creator/TestCreateForm').then(mod => ({ default: mod.TestCreateForm })), 
  { ssr: false }
)

function TestAIContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const view = searchParams.get('view') || 'dashboard'
  const { tests, attempts } = useTestStore()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="text-white/60 text-base">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }
  
  const handleNavigate = (newView: string) => {
    router.push(`/?view=${newView}`)
    setSidebarOpen(false)
  }
  
  const navItems = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: Home },
    { id: 'tests', label: 'Testlarim', icon: FileText },
    { id: 'create', label: 'Test yaratish', icon: Plus },
    { id: 'statistics', label: 'Statistika', icon: BarChart3 },
    { id: 'leaderboard', label: 'Reyting', icon: Trophy },
    { id: 'profile', label: 'Profil', icon: User },
  ]
  
  // Test solving view
  if (view === 'solve') {
    return <TestSolver />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/testai-logo.png" 
              alt="TestAI" 
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">TestAI</h1>
              <p className="text-xs text-gray-400">Aqlli test tizimi</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white w-12 h-12"
          >
            {sidebarOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </Button>
        </div>
      </header>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 sm:w-80 bg-slate-900/95 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 border-b border-white/10 flex items-center gap-4">
          <img 
            src="/testai-logo.png" 
            alt="TestAI" 
            className="w-14 h-14 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              TestAI
            </h1>
            <p className="text-sm text-gray-400">Aqlli test tizimi</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-left text-lg",
                view === item.id
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-6 h-6" />
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* Stats */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-white/10">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">{tests.length}</p>
              <p className="text-sm text-gray-400">Testlar</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">{attempts.length}</p>
              <p className="text-sm text-gray-400">Urinishlar</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="lg:ml-72 xl:ml-80 min-h-screen">
        {view === 'tests' && <TestsList />}
        {view === 'dashboard' && <DashboardContent />}
        {view === 'create' && <TestCreateForm />}
        {(view === 'statistics' || view === 'leaderboard' || view === 'profile' || view === 'settings') && (
          <div className="p-6 sm:p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Tez orada</h2>
              <p className="text-lg text-gray-400 mb-8">
                Bu bo&apos;lim hozir ishlanmoqda. Tez orada foydalanishingiz mumkin bo&apos;ladi.
              </p>
              <Button
                onClick={() => handleNavigate('dashboard')}
                className="bg-purple-500 hover:bg-purple-600 text-lg px-6 py-3"
              >
                <Home className="w-5 h-5 mr-2" />
                Bosh sahifaga qaytish
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function TestAIPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="text-white/60 text-base">Yuklanmoqda...</p>
        </div>
      </div>
    }>
      <TestAIContent />
    </Suspense>
  )
}
