'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Account {
  id: string
  name: string
  type: 'DEBIT' | 'CREDIT' | 'VOUCHER'
  balance: string
  cutDay: number | null
  payDay: number | null
}

export default function AccountsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'DEBIT' as 'DEBIT' | 'CREDIT' | 'VOUCHER',
    balance: 0
  })

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then(res => res.json()),
    enabled: !!session
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setShowForm(false)
      setFormData({ name: '', type: 'DEBIT', balance: 0 })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/accounts/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    }
  })

  if (status === 'loading') return <div className="p-8 text-white">Loading...</div>
  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Accounts</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'New Account'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Add Account</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Account Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="DEBIT">Debit (Cash/Bank)</option>
                <option value="CREDIT">Credit Card</option>
                <option value="VOUCHER">Voucher (Prepaid)</option>
              </select>
              <input
                type="number"
                placeholder="Initial Balance"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              />
              <button
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending}
                className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : accounts.length === 0 ? (
          <p className="text-gray-400 text-center">No accounts yet. Create one to get started.</p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-white font-medium">{account.name}</h3>
                  <span className="text-gray-400 text-sm">{account.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xl font-bold ${parseFloat(account.balance) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    ${parseFloat(account.balance).toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(account.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}