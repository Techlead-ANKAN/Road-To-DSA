import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Save, Tag, FileText, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { webAssignmentAPI } from '../api/webAssignment';

const LoadingState = () => (
  <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center text-sm text-slate-500">
    Loading assignments...
  </div>
);

const ErrorState = ({ message }) => (
  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
    <div className="flex items-center gap-2">
      <AlertCircle className="h-5 w-5" />
      {message}
    </div>
  </div>
);

const AssignmentModal = ({ assignment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    tags: assignment?.tags?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter an assignment title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter an assignment description');
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);

    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      tags: tagsArray
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {assignment ? 'Edit Assignment' : 'New Assignment'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Assignment Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g., Build a Responsive Landing Page"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description (Markdown supported)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              rows="10"
              placeholder="Enter assignment description in Markdown format..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="HTML, CSS, JavaScript, Responsive"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              {assignment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminWebAssignments = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Fetch all assignments
  const { data: assignments = [], isLoading, error } = useQuery({
    queryKey: ['webAssignments'],
    queryFn: webAssignmentAPI.getAllAssignments
  });

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: webAssignmentAPI.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries(['webAssignments']);
      toast.success('Assignment created successfully!');
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  });

  // Update assignment mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => webAssignmentAPI.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['webAssignments']);
      toast.success('Assignment updated successfully!');
      setIsModalOpen(false);
      setEditingAssignment(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    }
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: webAssignmentAPI.deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries(['webAssignments']);
      toast.success('Assignment deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    }
  });

  const handleSave = (formData) => {
    if (editingAssignment) {
      updateMutation.mutate({ id: editingAssignment._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAssignment(null);
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Web Assignments</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage HTML, CSS, and JavaScript practice assignments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Assignment
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-surface-border bg-surface p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Assignments</p>
              <p className="text-2xl font-bold text-slate-900">{assignments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-border bg-surface p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No assignments yet</h3>
            <p className="mt-2 text-sm text-slate-600">
              Get started by creating your first web development assignment.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create First Assignment
            </button>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="rounded-2xl border border-surface-border bg-surface p-6 transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{assignment.title}</h3>
                  
                  <div className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {assignment.description.substring(0, 200)}
                    {assignment.description.length > 200 && '...'}
                  </div>

                  {assignment.tags && assignment.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {assignment.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-slate-500">
                    {assignment.solutions?.length || 0} solution(s) submitted
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(assignment)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(assignment._id, assignment.title)}
                    className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AssignmentModal
          assignment={editingAssignment}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminWebAssignments;
