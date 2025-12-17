import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, X, Save, Tag, Code, FileText, AlertCircle, FolderPlus } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import {
  fetchSubjects,
  fetchQuestionsBySubject,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  fetchStats,
  createSubject,
  updateSubject,
  deleteSubject
} from '../api/interviewQuestion.js'

const LoadingState = () => (
  <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center text-sm text-slate-500">
    Loading questions...
  </div>
)

const ErrorState = ({ message }) => (
  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
    <div className="flex items-center gap-2">
      <AlertCircle className="h-5 w-5" />
      {message}
    </div>
  </div>
)

const SubjectModal = ({ subject, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: subject?.name || '',
    description: subject?.description || '',
    order: subject?.order || 0
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please enter a subject name')
      return
    }

    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-y-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
        <div className="border-b border-surface-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {subject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Subject Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-100"
              placeholder="e.g., DSA, Java, React, SQL"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-100"
              placeholder="Brief description of this subject"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Order (optional)
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-100"
              placeholder="0"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Save className="h-4 w-4" />
              {subject ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const QuestionModal = ({ question, onClose, onSave, subjects }) => {
  const [formData, setFormData] = useState({
    subject: question?.subject || '',
    question: question?.question || '',
    answer: question?.answer || '',
    answerFormat: question?.answerFormat || 'text',
    difficulty: question?.difficulty || '',
    tags: question?.tags?.join(', ') || '',
    order: question?.order || 0
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    }

    onSave(submitData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-surface-border bg-surface shadow-xl">
        <div className="sticky top-0 border-b border-surface-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {question ? 'Edit Question' : 'Add New Question'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Subject <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-100"
              required
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Question <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-100"
              placeholder="Enter the interview question"
              required
            />
          </div>

          {/* Answer Format */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Answer Format <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-3">
              {[
                { value: 'text', label: 'Text', icon: FileText },
                { value: 'code', label: 'Code', icon: Code },
                { value: 'markdown', label: 'Markdown', icon: FileText }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, answerFormat: value })}
                  className={clsx(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/40',
                    formData.answerFormat === value
                      ? 'bg-primary text-white'
                      : 'border border-surface-border bg-surface-muted text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Answer <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={8}
              className={clsx(
                'w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-100',
                formData.answerFormat === 'code' && 'font-mono'
              )}
              placeholder={
                formData.answerFormat === 'code'
                  ? 'Enter code here...'
                  : formData.answerFormat === 'markdown'
                  ? 'Enter markdown formatted answer...'
                  : 'Enter the answer...'
              }
              required
            />
          </div>

          {/* Difficulty and Tags Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-100"
              >
                <option value="">None</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Order (optional)
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-100"
                placeholder="0"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Tags (comma-separated)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-100"
                placeholder="e.g., arrays, strings, sorting"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-surface-border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <Save className="h-4 w-4" />
              {question ? 'Update Question' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AdminInterviewQuestionsPage = () => {
  const queryClient = useQueryClient()
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [subjectModalOpen, setSubjectModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [editingSubject, setEditingSubject] = useState(null)

  const subjectsQuery = useQuery({
    queryKey: ['interviewSubjects'],
    queryFn: fetchSubjects
  })

  const statsQuery = useQuery({
    queryKey: ['interviewStats'],
    queryFn: fetchStats
  })

  const questionsQuery = useQuery({
    queryKey: ['interviewQuestions', selectedSubject],
    queryFn: () => fetchQuestionsBySubject(selectedSubject),
    enabled: Boolean(selectedSubject)
  })

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['interviewSubjects'])
      queryClient.invalidateQueries(['interviewStats'])
      setSubjectModalOpen(false)
      toast.success('Subject created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create subject')
    }
  })

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }) => updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['interviewSubjects'])
      queryClient.invalidateQueries(['interviewQuestions'])
      queryClient.invalidateQueries(['interviewStats'])
      setSubjectModalOpen(false)
      setEditingSubject(null)
      toast.success('Subject updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update subject')
    }
  })

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['interviewSubjects'])
      queryClient.invalidateQueries(['interviewStats'])
      setSelectedSubject(null)
      toast.success('Subject deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete subject')
    }
  })

  const createMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['interviewSubjects'])
      queryClient.invalidateQueries(['interviewQuestions'])
      queryClient.invalidateQueries(['interviewStats'])
      setModalOpen(false)
      toast.success('Question created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create question')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['interviewSubjects'])
      queryClient.invalidateQueries(['interviewQuestions'])
      queryClient.invalidateQueries(['interviewStats'])
      setModalOpen(false)
      setEditingQuestion(null)
      toast.success('Question updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update question')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['interviewSubjects'])
      queryClient.invalidateQueries(['interviewQuestions'])
      queryClient.invalidateQueries(['interviewStats'])
      toast.success('Question deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete question')
    }
  })

  const handleSave = (data) => {
    if (editingQuestion) {
      updateMutation.mutate({ id: editingQuestion._id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (question) => {
    setEditingQuestion(question)
    setModalOpen(true)
  }

  const handleDelete = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteMutation.mutate(questionId)
    }
  }

  const handleAddNew = () => {
    setEditingQuestion(null)
    setModalOpen(true)
  }

  const handleAddSubject = () => {
    setEditingSubject(null)
    setSubjectModalOpen(true)
  }

  const handleEditSubject = (subject) => {
    setEditingSubject(subject)
    setSubjectModalOpen(true)
  }

  const handleDeleteSubject = (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject? This will fail if there are questions using it.')) {
      deleteSubjectMutation.mutate(subjectId)
    }
  }

  const handleSaveSubject = (data) => {
    if (editingSubject) {
      updateSubjectMutation.mutate({ id: editingSubject._id, data })
    } else {
      createSubjectMutation.mutate(data)
    }
  }

  const subjects = subjectsQuery.data?.subjects || []
  const questions = questionsQuery.data?.questions || []
  const stats = statsQuery.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Manage Interview Questions
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Add and manage interview questions for different subjects
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAddSubject}
            className="inline-flex items-center gap-2 rounded-xl border border-primary bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-800"
          >
            <FolderPlus className="h-5 w-5" />
            Add Subject
          </button>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <Plus className="h-5 w-5" />
            Add Question
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Questions</div>
            <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.totalQuestions}
            </div>
          </div>
          <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Subjects</div>
            <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.totalSubjects}
            </div>
          </div>
          <div className="rounded-2xl border border-surface-border bg-surface p-5 shadow-sm">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg per Subject</div>
            <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.totalSubjects > 0 ? Math.round(stats.totalQuestions / stats.totalSubjects) : 0}
            </div>
          </div>
        </div>
      )}

      {/* Subject Filter */}
      {subjects.length > 0 && (
        <div className="rounded-2xl border border-surface-border bg-surface p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Filter by Subject</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubject(null)}
              className={clsx(
                'rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40',
                !selectedSubject
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-muted text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              All Subjects
            </button>
            {subjects.map((subject) => (
              <button
                key={subject._id}
                type="button"
                onClick={() => setSelectedSubject(subject.name)}
                className={clsx(
                  'rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40',
                  selectedSubject === subject.name
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-muted text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                )}
              >
                {subject.name}
                {stats?.bySubject?.find(s => s.subject === subject.name) && (
                  <span className="ml-2 text-xs opacity-75">
                    ({stats.bySubject.find(s => s.subject === subject.name).count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Questions List */}
      {selectedSubject ? (
        questionsQuery.isLoading ? (
          <LoadingState />
        ) : questionsQuery.error ? (
          <ErrorState message={questionsQuery.error.message} />
        ) : questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-12 text-center">
            <p className="text-sm text-slate-500">No questions found for {selectedSubject}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-surface-border bg-surface shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-surface-border bg-surface-muted">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Question
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Difficulty
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Format
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Tags
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {questions.map((question) => (
                    <tr key={question._id} className="hover:bg-surface-muted/50 transition">
                      <td className="px-5 py-4 text-sm text-slate-900 dark:text-slate-100">
                        <div className="max-w-md truncate">{question.question}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={clsx(
                            'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            question.difficulty === 'Easy' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                            question.difficulty === 'Medium' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                            question.difficulty === 'Hard' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          )}
                        >
                          {question.difficulty}
                        </span>
                      </td>
      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400 capitalize">
        {question.answerFormat}
      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {question.tags?.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                          {question.tags?.length > 2 && (
                            <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                              +{question.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(question)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-400"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(question._id)}
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400/40 dark:hover:bg-rose-900/20"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-12 text-center">
          <p className="text-sm text-slate-500">Select a subject to view and manage questions</p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <QuestionModal
          question={editingQuestion}
          subjects={subjects}
          onClose={() => {
            setModalOpen(false)
            setEditingQuestion(null)
          }}
          onSave={handleSave}
        />
      )}

            {/* Subject Modal */}
            {subjectModalOpen && (
              <SubjectModal
                subject={editingSubject}
                onClose={() => {
                  setSubjectModalOpen(false)
                  setEditingSubject(null)
                }}
                onSave={handleSaveSubject}
              />
            )}
          </div>
        )
      }
      
      export default AdminInterviewQuestionsPage
