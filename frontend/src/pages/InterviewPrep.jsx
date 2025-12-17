import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, ChevronDown, ChevronUp, Code, FileText, Tag } from 'lucide-react'
import clsx from 'clsx'
import { fetchSubjects, fetchQuestionsBySubject, fetchTags } from '../api/interviewQuestion.js'

const LoadingState = () => (
  <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center text-sm text-slate-500">
    Loading interview questions...
  </div>
)

const ErrorState = ({ message }) => (
  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
    {message}
  </div>
)

const EmptyState = ({ subject }) => (
  <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-12 text-center">
    <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
    <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">
      No questions yet
    </h3>
    <p className="mt-2 text-sm text-slate-500">
      {subject ? `No questions available for ${subject}` : 'Select a subject to view questions'}
    </p>
  </div>
)

const QuestionCard = ({ question, isExpanded, onToggle }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'Hard':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    }
  }

  const getFormatIcon = (format) => {
    switch (format) {
      case 'code':
        return <Code className="h-4 w-4" />
      case 'markdown':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface shadow-sm transition hover:shadow-card">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 text-left focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-semibold', getDifficultyColor(question.difficulty))}>
                {question.difficulty}
              </span>
              {question.tags && question.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {question.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {question.question}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">
              {getFormatIcon(question.answerFormat)}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-surface-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Answer</span>
            <span className="text-xs text-slate-500">({question.answerFormat})</span>
          </div>
          {question.answerFormat === 'code' ? (
            <pre className="rounded-xl bg-slate-900 p-4 text-sm text-slate-100 overflow-x-auto">
              <code>{question.answer}</code>
            </pre>
          ) : question.answerFormat === 'markdown' ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                {question.answer}
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {question.answer}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const InterviewPrepPage = () => {
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null)
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())

  const subjectsQuery = useQuery({
    queryKey: ['interviewSubjects'],
    queryFn: fetchSubjects
  })

  const tagsQuery = useQuery({
    queryKey: ['interviewTags', selectedSubject],
    queryFn: () => fetchTags(selectedSubject),
    enabled: Boolean(selectedSubject)
  })

  const questionsQuery = useQuery({
    queryKey: ['interviewQuestions', selectedSubject, selectedTag],
    queryFn: () => fetchQuestionsBySubject(selectedSubject, selectedTag),
    enabled: Boolean(selectedSubject)
  })

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject)
    setSelectedTag(null)
    setExpandedQuestions(new Set())
  }

  if (subjectsQuery.isLoading) {
    return <LoadingState />
  }

  if (subjectsQuery.error) {
    return <ErrorState message={subjectsQuery.error.message} />
  }

  const subjects = subjectsQuery.data?.subjects || []
  const tags = tagsQuery.data?.tags || []
  const questions = questionsQuery.data?.questions || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Interview Preparation</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Master key interview questions across different subjects
        </p>
      </div>

      {subjects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Subject Tabs */}
          <div className="rounded-2xl border border-surface-border bg-surface p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Select Subject</h2>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject._id}
                  type="button"
                  onClick={() => handleSubjectChange(subject.name)}
                  className={clsx(
                    'rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40',
                    selectedSubject === subject.name
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-muted text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                  )}
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Filter */}
          {selectedSubject && tags.length > 0 && (
            <div className="rounded-2xl border border-surface-border bg-surface p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Filter by Tag</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={clsx(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/40',
                    !selectedTag
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
                  )}
                >
                  All Topics
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={clsx(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/40',
                      selectedTag === tag
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface-muted text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
                    )}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Questions List */}
          {selectedSubject && (
            <div>
              {questionsQuery.isLoading ? (
                <LoadingState />
              ) : questionsQuery.error ? (
                <ErrorState message={questionsQuery.error.message} />
              ) : questions.length === 0 ? (
                <EmptyState subject={selectedSubject} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {selectedTag ? `${selectedTag} Questions` : `${selectedSubject} Questions`}
                    </h2>
                    <span className="text-sm text-slate-500">
                      {questions.length} question{questions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {questions.map((question) => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      isExpanded={expandedQuestions.has(question._id)}
                      onToggle={() => toggleQuestion(question._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default InterviewPrepPage
