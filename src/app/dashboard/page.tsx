'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Account {
  id: string
  name: string
  type: 'DEBIT' | 'CREDIT' | 'VOUCHER'
  balance: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then(res => res.json()),
    enabled: !!session
  })

  if (status === 'loading') return <div className="p-8 text-white">Loading...</div>
  if (!session) {
    router.push('/login')
    return null
  }

  const debitTotal = accounts
    .filter(a => a.type === 'DEBIT')
    .reduce((sum, a) => sum + parseFloat(a.balance), 0)

  const creditTotal = accounts
    .filter(a => a.type === 'CREDIT')
    .reduce((sum, a) => sum + parseFloat(a.balance), 0)

  const voucherTotal = accounts
    .filter(a => a.type === 'VOUCHER')
    .reduce((sum, a) => sum + parseFloat(a.balance), 0)

  const liquidity = debitTotal + voucherTotal + creditTotal

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">PennyWise</h1>
          <div className="flex gap-4">
            <Link href="/accounts" className="text-gray-400 hover:text-white">Accounts</Link>
            <Link href="/transactions" className="text-gray-400 hover:text-white">Transactions</Link>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="text-gray-400 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>

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
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm">Liquidity</p>
            <p className={`text-2xl font-bold ${liquidity >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${liquidity.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Accounts</h2>
          {isLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : accounts.length === 0 ? (
            <p className="text-gray-400">No accounts. <Link href="/accounts" className="text-blue-400">Create one</Link></p>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <span className="text-white">{account.name}</span>
                  <span className={`${parseFloat(account.balance) < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    ${parseFloat(account.balance).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}