'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

interface Account {
  id: string
  name: string
  type: 'DEBIT' | 'CREDIT' | 'VOUCHER'
  balance: string
}

interface Transaction {
  id: string
  accountId: string
  amount: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  date: string
  description: string
  account: Account
  relatedAccount?: Account
}

export default function TransactionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    accountId: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    description: ''
  })
  const [transferMode, setTransferMode] = useState(false)
  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: ''
  })

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then(res => res.json()),
    enabled: !!session
  })

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then(res => res.json()),
    enabled: !!session
  })

  const createMutation = useMutation({
    mutationFn: () => {
      return fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: formData.accountId,
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description
        })
      }).then(res => res.json())
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setShowForm(false)
      setFormData({ accountId: '', type: 'EXPENSE', amount: '', description: '' })
    }
  })

  const transferMutation = useMutation({
    mutationFn: () => {
      return fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: transferData.fromAccountId,
          toAccountId: transferData.toAccountId,
          amount: parseFloat(transferData.amount),
          description: transferData.description
        })
      }).then(res => res.json())
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setShowForm(false)
      setTransferMode(false)
      setTransferData({ fromAccountId: '', toAccountId: '', amount: '', description: '' })
    }
  })

  if (status === 'loading') return <div className="p-8 text-white">Loading...</div>
  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <div className="flex gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link>
            <Link href="/accounts" className="text-gray-400 hover:text-white">Accounts</Link>
          </div>
        </div>

        <button
          onClick={() => { setShowForm(!showForm); setTransferMode(false) }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
        >
          {showForm && !transferMode ? 'Cancel' : 'New Transaction'}
        </button>
        <button
          onClick={() => { setShowForm(!showForm); setTransferMode(true) }}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mb-6 ml-4"
        >
          {showForm && transferMode ? 'Cancel' : 'Transfer'}
        </button>

        {showForm && transferMode && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Transfer Money</h2>
            <div className="space-y-4">
              <select
                value={transferData.fromAccountId}
                onChange={(e) => setTransferData({ ...transferData, fromAccountId: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="">From Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name} (${parseFloat(account.balance).toFixed(2)})</option>
                ))}
              </select>
              
              <select
                value={transferData.toAccountId}
                onChange={(e) => setTransferData({ ...transferData, toAccountId: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="">To Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
              
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              />
              
              <input
                type="text"
                placeholder="Description (optional)"
                value={transferData.description}
                onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              />
              
              <button
                onClick={() => transferMutation.mutate()}
                disabled={transferMutation.isPending || !transferData.fromAccountId || !transferData.toAccountId || !transferData.amount}
                className="w-full bg-purple-600 text-white p-3 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        )}

        {showForm && !transferMode && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Add Transaction</h2>
            <div className="space-y-4">
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name} ({account.type})</option>
                ))}
              </select>
              
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
              
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              />
              
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600"
              />
              
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !formData.accountId || !formData.amount}
                className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Transaction'}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-400">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400 text-center">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map(tx => (
              <div key={tx.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{tx.description}</p>
                  <p className="text-gray-400 text-sm">
                    {tx.account.name} • {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`text-xl font-bold ${tx.type === 'INCOME' ? 'text-green-400' : tx.type === 'EXPENSE' ? 'text-red-400' : 'text-blue-400'}`}>
                  {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '↔'}
                  ${parseFloat(tx.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}