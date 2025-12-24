import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileCode2, X, Copy, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { webAssignmentAPI } from '../api/webAssignment';
import { useUser } from '../context/UserContext';

const CodeModal = ({ assignment, userSolution, onClose, onSave }) => {
  const [htmlCode, setHtmlCode] = useState(userSolution?.htmlCode || '');
  const [cssCode, setCssCode] = useState(userSolution?.cssCode || '');
  const [jsCode, setJsCode] = useState(userSolution?.jsCode || '');
  const [activeTab, setActiveTab] = useState('html');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ htmlCode, cssCode, jsCode });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (code, type) => {
    navigator.clipboard.writeText(code);
    toast.success(`${type} code copied!`);
  };

  const generatePreviewHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    ${jsCode}
  </script>
</body>
</html>
    `;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[95vh] w-[95vw] flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{assignment.title}</h2>
            <p className="text-sm text-slate-600">Write your HTML, CSS, and JavaScript code</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Assignment Description Sidebar */}
          <div className="w-1/2 overflow-y-auto border-r border-slate-200 bg-white p-8">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Assignment Details
            </h3>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
              {assignment.description}
            </pre>
            {assignment.tags && assignment.tags.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {assignment.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex flex-1 flex-col border-r border-slate-200">
            {/* Tabs */}
            <div className="flex items-center border-b border-slate-200 px-4 py-3">
              <div className="flex flex-1 gap-2">
                <button
                  onClick={() => setActiveTab('html')}
                  className={clsx(
                    'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === 'html'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  HTML
                </button>
                <button
                  onClick={() => setActiveTab('css')}
                  className={clsx(
                    'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === 'css'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  CSS
                </button>
                <button
                  onClick={() => setActiveTab('js')}
                  className={clsx(
                    'flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === 'js'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  JavaScript
                </button>
              </div>
            </div>

            {/* Code Area */}
            <div className="relative flex-1 overflow-hidden">
              {activeTab === 'html' && (
                <div className="relative h-full">
                  <textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    className="h-full w-full resize-none bg-slate-900 p-4 font-mono text-sm text-slate-100 focus:outline-none"
                    placeholder="Write your HTML code here..."
                  />
                  <button
                    onClick={() => handleCopy(htmlCode, 'HTML')}
                    className="absolute right-4 top-4 rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                    title="Copy HTML"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              )}

              {activeTab === 'css' && (
                <div className="relative h-full">
                  <textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="h-full w-full resize-none bg-slate-900 p-4 font-mono text-sm text-slate-100 focus:outline-none"
                    placeholder="Write your CSS code here..."
                  />
                  <button
                    onClick={() => handleCopy(cssCode, 'CSS')}
                    className="absolute right-4 top-4 rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                    title="Copy CSS"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              )}

              {activeTab === 'js' && (
                <div className="relative h-full">
                  <textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    className="h-full w-full resize-none bg-slate-900 p-4 font-mono text-sm text-slate-100 focus:outline-none"
                    placeholder="Write your JavaScript code here..."
                  />
                  <button
                    onClick={() => handleCopy(jsCode, 'JavaScript')}
                    className="absolute right-4 top-4 rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                    title="Copy JavaScript"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="flex w-1/2 flex-col">
              <div className="border-b border-slate-200 p-4">
                <h3 className="font-semibold text-slate-900">Preview</h3>
              </div>
              <div className="flex-1 overflow-auto bg-white p-4">
                <iframe
                  srcDoc={generatePreviewHTML()}
                  className="h-full w-full rounded-lg border border-slate-200"
                  title="Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssignmentRow = ({ assignment, index, userSolution, onToggleComplete, onOpenCode }) => {
  const isCompleted = userSolution?.completed;
  const completedAt = userSolution?.completedAt ? new Date(userSolution.completedAt) : null;

  return (
    <div
      className={clsx(
        'grid grid-cols-1 gap-4 rounded-xl border border-surface-border bg-surface p-4 transition md:grid-cols-[auto,1fr,auto] md:items-center',
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-900/20'
          : 'hover:-translate-y-0.5 hover:shadow-card'
      )}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={Boolean(isCompleted)}
          onChange={() => onToggleComplete(assignment._id, !isCompleted)}
          className="h-5 w-5 rounded border border-slate-300 text-primary focus:ring-primary"
          aria-label={assignment.title}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Assignment {index + 1}</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {assignment.title}
          </p>
          {completedAt && (
            <p className="text-xs text-slate-500">
              Completed {completedAt.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {assignment.tags && assignment.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {assignment.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
              >
                {tag}
              </span>
            ))}
            {assignment.tags.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                +{assignment.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onOpenCode(assignment, userSolution)}
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <FileCode2 className="h-4 w-4" />
          Code
        </button>
      </div>
    </div>
  );
};

const WebPractice = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [filterTag, setFilterTag] = useState('all');
  const [codeModal, setCodeModal] = useState({ open: false, assignment: null, userSolution: null });

  // Fetch all assignments
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['webAssignments'],
    queryFn: webAssignmentAPI.getAllAssignments,
  });

  // Get unique tags
  const allTags = [...new Set(assignments.flatMap((a) => a.tags || []))];

  // Filter assignments
  const filteredAssignments =
    filterTag === 'all'
      ? assignments
      : assignments.filter((a) => a.tags?.includes(filterTag));

  // Mark complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: ({ assignmentId, completed }) =>
      webAssignmentAPI.markComplete(assignmentId, { userId: user.userId, completed }),
    onSuccess: () => {
      queryClient.invalidateQueries(['webAssignments']);
      toast.success('Assignment status updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  // Save solution mutation
  const saveSolutionMutation = useMutation({
    mutationFn: ({ assignmentId, code }) =>
      webAssignmentAPI.saveSolution(assignmentId, {
        userId: user.userId,
        ...code,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['webAssignments']);
      toast.success('Code saved successfully!');
      setCodeModal({ open: false, assignment: null, userSolution: null });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save code');
    },
  });

  const handleToggleComplete = (assignmentId, completed) => {
    if (!user) {
      toast.error('Please set up your profile first');
      return;
    }
    markCompleteMutation.mutate({ assignmentId, completed });
  };

  const handleOpenCode = (assignment, userSolution) => {
    setCodeModal({ open: true, assignment, userSolution });
  };

  const handleSaveCode = (code) => {
    return saveSolutionMutation.mutateAsync({
      assignmentId: codeModal.assignment._id,
      code,
    });
  };

  // Get user's solution for each assignment
  const getAssignmentSolution = (assignment) => {
    if (!user) return null;
    return assignment.solutions?.find((sol) => sol.userId === user.userId);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-slate-500">Loading assignments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Web Development Practice</h1>
        <p className="mt-1 text-sm text-slate-600">
          Practice HTML, CSS, and JavaScript with hands-on assignments
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Filter by tag:</label>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <div className="ml-auto text-sm text-slate-600">
          {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-12 text-center">
            <FileCode2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No assignments found</h3>
            <p className="mt-2 text-sm text-slate-600">
              {filterTag === 'all'
                ? 'No assignments available yet.'
                : `No assignments found with tag "${filterTag}".`}
            </p>
          </div>
        ) : (
          filteredAssignments.map((assignment, index) => (
            <AssignmentRow
              key={assignment._id}
              assignment={assignment}
              index={index}
              userSolution={getAssignmentSolution(assignment)}
              onToggleComplete={handleToggleComplete}
              onOpenCode={handleOpenCode}
            />
          ))
        )}
      </div>

      {/* Code Modal */}
      {codeModal.open && (
        <CodeModal
          assignment={codeModal.assignment}
          userSolution={codeModal.userSolution}
          onClose={() => setCodeModal({ open: false, assignment: null, userSolution: null })}
          onSave={handleSaveCode}
        />
      )}
    </div>
  );
};

export default WebPractice;
