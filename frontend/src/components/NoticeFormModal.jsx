import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const NoticeFormModal = ({ open, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
    noticeLevel: initialData?.noticeLevel || 'medium',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        ...formData,
        deadline: formData.deadline || null,
      };
      onSubmit(submitData);
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        deadline: '',
        noticeLevel: 'medium',
      });
      setErrors({});
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form and errors
    setFormData({
      title: initialData?.title || '',
      description: initialData?.description || '',
      deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
      noticeLevel: initialData?.noticeLevel || 'medium',
    });
    setErrors({});
  };

  const content = useMemo(() => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {initialData ? 'Edit Notice' : 'Create New Notice'}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-surface-muted hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={200}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-rose-300 focus:ring-rose-500/40'
                    : 'border-surface-border focus:border-primary focus:ring-primary/40'
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100`}
                placeholder="Enter notice title"
              />
              {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                rows={4}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.description
                    ? 'border-rose-300 focus:ring-rose-500/40'
                    : 'border-surface-border focus:border-primary focus:ring-primary/40'
                } bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100`}
                placeholder="Enter notice description"
              />
              {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Deadline (Optional)
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Notice Level */}
            <div>
              <label htmlFor="noticeLevel" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Priority Level <span className="text-rose-500">*</span>
              </label>
              <select
                id="noticeLevel"
                name="noticeLevel"
                value={formData.noticeLevel}
                onChange={handleChange}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {initialData ? 'Update Notice' : 'Create Notice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [open, formData, errors, initialData]);

  return createPortal(content, document.body);
};
