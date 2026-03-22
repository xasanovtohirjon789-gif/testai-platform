'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useTestStore, type Question, type TestCategory, type DifficultyLevel, CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/store/testStore'
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Loader2,
  FileText,
  ListOrdered,
  CheckCircle2,
  Save,
  Check
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const generateId = () => Math.random().toString(36).substr(2, 9)

export function TestCreateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { addTest, updateTest, getTest } = useTestStore()
  
  const editId = searchParams.get('editId')
  const isEditing = !!editId
  
  const [testName, setTestName] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState(0)
  const [category, setCategory] = useState<TestCategory>('boshqa')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('orta')
  const [shuffleQuestions, setShuffleQuestions] = useState(true)
  const [passingScore, setPassingScore] = useState(60)
  const [questions, setQuestions] = useState<Question[]>([
    { id: generateId(), text: '', options: ['', '', '', ''], correctAnswer: 0 }
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiQuestionCount, setAiQuestionCount] = useState(5)
  const [showAiDialog, setShowAiDialog] = useState(false)

  useEffect(() => {
    if (editId) {
      const existingTest = getTest(editId)
      if (existingTest) {
        setTestName(existingTest.name)
        setDescription(existingTest.description || '')
        setTimeLimit(existingTest.timeLimit || 0)
        setCategory(existingTest.category || 'boshqa')
        setDifficulty(existingTest.difficulty || 'orta')
        setShuffleQuestions(existingTest.shuffleQuestions ?? true)
        setPassingScore(existingTest.passingScore || 60)
        setQuestions(existingTest.questions)
      } else {
        toast({ title: 'Test topilmadi', variant: 'destructive' })
        router.push('/testai?view=tests')
      }
    }
  }, [editId, getTest, router, toast])

  const currentStep = !testName.trim() ? 1 : 
    !questions.some(q => q.text.trim() && q.options.filter(o => o.trim()).length >= 2) ? 2 : 3

  const addQuestion = () => {
    setQuestions([...questions, { id: generateId(), text: '', options: ['', '', '', ''], correctAnswer: 0 }])
    toast({ title: 'Savol qo\'shildi' })
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
      toast({ title: 'Savol o\'chirildi', variant: 'destructive' })
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, options: q.options.map((opt, i) => i === optionIndex ? value : opt) } : q
    ))
  }

  const generateWithAI = async () => {
    if (!aiTopic.trim()) {
      toast({ title: 'Mavzu kiriting', variant: 'destructive' })
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, count: aiQuestionCount }),
      })

      const data = await response.json()
      
      if (data.questions) {
        setQuestions(data.questions.map((q: any) => ({
          id: generateId(),
          text: q.question,
          options: q.options,
          correctAnswer: q.correct,
        })))
        if (!testName.trim()) setTestName(aiTopic)
        toast({ title: 'Savollar yaratildi! ✅', description: `${data.questions.length} ta savol` })
      }
    } catch (error) {
      const demoQuestions = Array.from({ length: aiQuestionCount }, (_, i) => ({
        id: generateId(),
        text: `${aiTopic} haqida ${i + 1}-savol?`,
        options: ['Birinchi javob', 'Ikkinchi javob', 'Uchinchi javob', 'To\'rtinchi javob'],
        correctAnswer: i % 4,
      }))
      setQuestions(demoQuestions)
      if (!testName.trim()) setTestName(aiTopic)
      toast({ title: 'Demo savollar yaratildi' })
    } finally {
      setIsGenerating(false)
      setShowAiDialog(false)
    }
  }

  const validateForm = () => {
    if (!testName.trim()) {
      toast({ title: 'Test nomi kerak', variant: 'destructive' })
      return false
    }
    if (questions.some(q => !q.text.trim() || q.options.filter(o => o.trim()).length < 2)) {
      toast({ title: 'Savollar to\'liq emas', variant: 'destructive' })
      return false
    }
    return true
  }

  const handleSave = async (status: 'draft' | 'active') => {
    if (!validateForm()) return
    setIsSaving(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const testData = {
        name: testName,
        description,
        timeLimit,
        category,
        difficulty,
        shuffleQuestions,
        passingScore,
        questions,
        status,
      }
      
      if (isEditing && editId) {
        updateTest(editId, testData)
        toast({ title: 'Test yangilandi! ✅' })
      } else {
        addTest(testData)
        toast({ title: status === 'active' ? 'Test nashr etildi! 🎉' : 'Test saqlandi! ✅' })
      }

      router.push('/testai?view=tests')
    } catch (error) {
      toast({ title: 'Xatolik yuz berdi', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {isEditing ? 'Testni tahrirlash' : 'Test yaratish'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isEditing ? 'Test ma\'lumotlarini o\'zgartiring' : 'Yangi test yarating'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setShowAiDialog(true)}>
            <Sparkles className="h-4 w-4" />
            AI yordam
          </Button>
          <Button className="gap-2 bg-green-500 hover:bg-green-600 text-white" onClick={() => handleSave('active')} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Nashr etish
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              {currentStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
            </div>
            {step < 3 && <div className={`w-12 h-0.5 ${currentStep > step ? 'bg-green-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-green-400" />
                Test ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white">Test nomi *</Label>
                  <Input placeholder="Masalan: Matematika testi" value={testName} onChange={(e) => setTestName(e.target.value)} className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Kategoriya</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TestCategory)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Qiyinlik darajasi</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTY_LABELS).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Vaqt limiti (daqiqada)</Label>
                  <Input type="number" min="0" placeholder="30" value={timeLimit || ''} onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)} className="h-11 bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">O'tish bali (%)</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={passingScore} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setPassingScore(0);
                      } else {
                        const num = parseInt(val);
                        if (!isNaN(num) && num >= 0 && num <= 100) {
                          setPassingScore(num);
                        }
                      }
                    }} 
                    className="h-11 bg-white/10 border-white/20 text-white" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-white">Tavsif</Label>
                  <Textarea placeholder="Test haqida ma'lumot..." value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <ListOrdered className="h-5 w-5 text-green-400" />
                  Savollar
                </CardTitle>
                <Badge variant="secondary" className="bg-green-500/20 text-green-300">{questions.length} savol</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[500px] pr-4">
                <div className="space-y-6">
                  {questions.map((question, qIndex) => (
                    <div key={question.id} className="space-y-4 pb-6 border-b border-white/10 last:border-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="border-white/20 text-white">{qIndex + 1}-savol</Badge>
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(question.id)} disabled={questions.length === 1} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea placeholder="Savolni kiriting..." value={question.text} onChange={(e) => updateQuestion(question.id, 'text', e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
                      
                      {/* Variantlar - To'g'ri javob YASHIL */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Javob variantlari (to'g'ri javobni bosing):</p>
                        <div className="grid grid-cols-2 gap-3">
                          {question.options.map((option, oIndex) => {
                            const isCorrect = question.correctAnswer === oIndex
                            return (
                              <div
                                key={oIndex}
                                onClick={() => updateQuestion(question.id, 'correctAnswer', oIndex)}
                                className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                                  isCorrect 
                                    ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20' 
                                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                }`}
                              >
                                {/* Harf belgisi */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                  isCorrect 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-white/10 text-gray-400'
                                }`}>
                                  {isCorrect ? <Check className="w-5 h-5" /> : String.fromCharCode(65 + oIndex)}
                                </div>
                                
                                {/* Input */}
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`border-0 flex-1 bg-transparent ${
                                    isCorrect 
                                      ? 'text-green-300 placeholder:text-green-500/50' 
                                      : 'text-white placeholder:text-gray-500'
                                  }`}
                                  placeholder={`Variant ${String.fromCharCode(65 + oIndex)}`}
                                />
                                
                                {/* To'g'ri javob belgisi */}
                                {isCorrect && (
                                  <div className="absolute top-1 right-1">
                                    <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">
                                      To'g'ri
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button variant="outline" className="w-full mt-4 gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={addQuestion}>
                <Plus className="h-4 w-4" /> Savol qo'shish
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Test xulosasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between"><span className="text-gray-400">Savollar</span><Badge className="bg-green-500/20 text-green-300">{questions.length}</Badge></div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between"><span className="text-gray-400">Vaqt</span><Badge className="bg-white/10 text-white">{timeLimit || 'Cheksiz'}</Badge></div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between"><span className="text-gray-400">O'tish bali</span><Badge className="bg-white/10 text-white">{passingScore}%</Badge></div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Aralashtirish</span>
                <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
              </div>
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => handleSave('draft')} disabled={isSaving}>
                  <Save className="h-4 w-4" /> Qoralama
                </Button>
                <Button className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white" onClick={() => handleSave('active')} disabled={isSaving}>
                  <CheckCircle2 className="h-4 w-4" /> Nashr etish
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Dialog */}
      <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-green-400" />
              AI yordamida savollar yaratish
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white">Mavzu</Label>
              <Input placeholder="Masalan: Informatika 7-sinf" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Savollar soni: {aiQuestionCount}</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setAiQuestionCount(Math.max(1, aiQuestionCount - 1))} className="bg-white/10 border-white/20 text-white">-</Button>
                <Input type="range" min="1" max="50" value={aiQuestionCount} onChange={(e) => setAiQuestionCount(parseInt(e.target.value))} className="flex-1" />
                <Button variant="outline" size="icon" onClick={() => setAiQuestionCount(Math.min(50, aiQuestionCount + 1))} className="bg-white/10 border-white/20 text-white">+</Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setShowAiDialog(false)}>Bekor</Button>
              <Button className="flex-1 gap-2 bg-green-500 hover:bg-green-600 text-white" onClick={generateWithAI} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Yaratish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
