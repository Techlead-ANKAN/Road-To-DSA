import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createOrFetchUser } from '../api/user.js'
import { useUser } from '../context/UserContext.jsx'
import toast from 'react-hot-toast'

const initialForm = {
  name: '',
  email: ''
}

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email)

export const UserSetupCard = () => {
  const [form, setForm] = useState(initialForm)
  const { setUser } = useUser()

  const mutation = useMutation({
    mutationFn: createOrFetchUser,
    onSuccess: (data) => {
      setUser({ userId: data.userId, name: data.name, email: data.email })
      toast.success('Profile saved')
      setForm(initialForm)
    },
    onError: (error) => toast.error(error.message)
  })

  const onSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!isValidEmail(form.email)) {
      toast.error('Provide a valid email')
      return
    }
    mutation.mutate({ name: form.name.trim(), email: form.email.trim() })
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
      <h2 className="text-xl font-semibold">Create your profile</h2>
      <p className="mt-2 text-sm text-slate-500">
        Enter your details to start tracking progress. You will use the same email when you return.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="user-name" className="text-sm font-medium text-slate-600">
            Name
          </label>
          <input
            id="user-name"
            type="text"
            className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Jane Doe"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="user-email" className="text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            id="user-email"
            type="email"
            className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="jane@domain.com"
            autoComplete="email"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40"
          disabled={mutation.isLoading}
        >
          {mutation.isLoading ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}
