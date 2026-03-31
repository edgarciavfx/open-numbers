'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

interface Account {
  id: string
  name: string
  type: 'DEBIT' | 'CREDIT' | 'VOUCHER'
  balance: string
}

interface DashboardData {
  debitTotal: number
  creditTotal: number
  voucherTotal: number
  liquidity: number
  accounts: Account[]
}

interface Transaction {
  id: string
  accountId: string
  amount: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  date: string
  description: string
  account: Account
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [quickEntry, setQuickEntry] = useState(false)
  const [formData, setFormData] = useState({
    accountId: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    description: ''
  })

  const { data: dashboard } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then(res => res.json()),
    enabled: !!session
  })

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then(res => res.json()),
    enabled: !!session
  })

  const { data: recentTx = [] } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then(res => res.json()),
    enabled: !!session
  })

  const createMutation = useMutation({
    mutationFn: () => fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: formData.accountId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description
      })
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setQuickEntry(false)
      setFormData({ accountId: '', type: 'EXPENSE', amount: '', description: '' })
    }
  })

  if (status === 'loading') return <div className="p-8 text-white">Loading...</div>
  if (!session) {
    router.push('/login')
    return null
  }

  const debitTotal = dashboard?.debitTotal ?? 0
  const creditTotal = dashboard?.creditTotal ?? 0
  const voucherTotal = dashboard?.voucherTotal ?? 0
  const liquidity = dashboard?.liquidity ?? 0

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">PennyWise</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setQuickEntry(!quickEntry)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {quickEntry ? 'Cancel' : '+ Quick Entry'}
            </button>
            <Link href="/accounts" className="text-gray-400 hover:text-white">Accounts</Link>
            <Link href="/transactions" className="text-gray-400 hover:text-white">Transactions</Link>
            <button
              onClick={() => {
                if (confirm('Delete all transactions and accounts?')) {
                  fetch('/api/cleanup', { method: 'DELETE' }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
                    queryClient.invalidateQueries({ queryKey: ['accounts'] })
                    queryClient.invalidateQueries({ queryKey: ['transactions'] })
                  })
                }
              }}
              className="text-red-400 hover:text-red-300"
            >
              Reset
            </button>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-gray-400 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>

        {quickEntry && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex gap-2">
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              >
                <option value="">Account</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              >
                <option value="EXPENSE">-</option>
                <option value="INCOME">+</option>
              </select>
              <input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-24 p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="flex-1 p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
              />
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !formData.accountId || !formData.amount}
                className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Cash (Debit)</p>
            <p className="text-2xl font-bold text-green-400">${debitTotal.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Vouchers</p>
            <p className="text-2xl font-bold text-green-400">${voucherTotal.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Debt (Credit)</p>
            <p className="text-2xl font-bold text-red-400">${creditTotal.toFixed(2)}</p>
          </div>
          <div className={`bg-gray-800 p-6 rounded-lg ${liquidity < 0 ? 'ring-2 ring-red-500' : ''}`}>
            <p className="text-gray-400 text-sm">Liquidity</p>
            <p className={`text-2xl font-bold ${liquidity >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${liquidity.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Accounts</h2>
            {!dashboard?.accounts?.length ? (
              <p className="text-gray-400">No accounts. <Link href="/accounts" className="text-blue-400">Create one</Link></p>
            ) : (
              <div className="space-y-2">
                {dashboard.accounts.map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <div>
                      <span className="text-white">{account.name}</span>
                      <span className="ml-2 text-xs text-gray-400">({account.type})</span>
                    </div>
                    <span className={`font-bold ${parseFloat(account.balance) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ${parseFloat(account.balance).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Recent</h2>
            {!recentTx.length ? (
              <p className="text-gray-400">No transactions yet.</p>
            ) : (
              <div className="space-y-2">
                {recentTx.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                    <div>
                      <span className="text-white text-sm">{tx.description}</span>
                      <span className="ml-2 text-xs text-gray-400">{tx.account.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${tx.type === 'INCOME' ? 'text-green-400' : tx.type === 'EXPENSE' ? 'text-red-400' : 'text-blue-400'}`}>
                      {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '↔'}${parseFloat(tx.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}