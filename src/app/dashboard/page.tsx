'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, TrendingUp, TrendingDown, CreditCard, Wallet, AlertCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

const COLORS = ['#22c55e', '#ef4444', '#eab308']

function LiquidityChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value) => `$${(value as number).toFixed(2)}`}
        />
      </PieChart>
    </ResponsiveContainer>
  )
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

  const { data: dashboard, isLoading } = useQuery<DashboardData>({
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
      toast.success('Transaction added')
    },
    onError: () => {
      toast.error('Failed to add transaction')
    }
  })

  const resetMutation = useMutation({
    mutationFn: () => fetch('/api/cleanup', { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast.success('All data cleared')
    }
  })

  if (status === 'loading') return <div className="p-8">Loading...</div>
  if (!session) {
    router.push('/login')
    return null
  }

  const debitTotal = dashboard?.debitTotal ?? 0
  const creditTotal = dashboard?.creditTotal ?? 0
  const voucherTotal = dashboard?.voucherTotal ?? 0
  const liquidity = dashboard?.liquidity ?? 0

  const pieData = [
    { name: 'Cash', value: debitTotal },
    { name: 'Debt', value: Math.abs(creditTotal) },
    { name: 'Vouchers', value: voucherTotal }
  ].filter(d => d.value > 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Quick Entry */}
        {quickEntry && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="w-full sm:w-40">
                  <Label>Account</Label>
                  <Select value={formData.accountId} onValueChange={(v) => v && setFormData({ ...formData, accountId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => v && setFormData({ ...formData, type: v as 'INCOME' | 'EXPENSE' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPENSE">- Expense</SelectItem>
                      <SelectItem value="INCOME">+ Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-28">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Label>Description</Label>
                  <Input
                    placeholder="What for?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !formData.accountId || !formData.amount}>
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={() => setQuickEntry(false)}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={liquidity < 0 ? 'border-destructive' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">Cash</span>
              </div>
              <p className="text-2xl font-bold text-green-500">${debitTotal.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Vouchers</span>
              </div>
              <p className="text-2xl font-bold text-green-500">${voucherTotal.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">Debt</span>
              </div>
              <p className="text-2xl font-bold text-red-500">${creditTotal.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className={liquidity < 0 ? 'border-destructive ring-2 ring-destructive/20' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                {liquidity < 0 ? <AlertCircle className="h-4 w-4 text-destructive" /> : <TrendingUp className="h-4 w-4" />}
                <span className="text-sm">Liquidity</span>
              </div>
              <p className={`text-2xl font-bold ${liquidity >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                ${liquidity.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant={quickEntry ? 'outline' : 'default'} onClick={() => setQuickEntry(!quickEntry)}>
            <Plus className="h-4 w-4 mr-2" />
            {quickEntry ? 'Cancel' : 'Quick Entry'}
          </Button>
        </div>

        {/* Charts & Lists */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {!dashboard?.accounts?.length ? (
                <p className="text-muted-foreground text-center py-4">No accounts yet</p>
              ) : (
                <div className="space-y-3">
                  {dashboard.accounts.map((account) => (
                    <div key={account.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{account.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">({account.type})</span>
                      </div>
                      <span className={`font-bold ${parseFloat(account.balance) < 0 ? 'text-destructive' : 'text-green-500'}`}>
                        ${parseFloat(account.balance).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <LiquidityChart data={pieData} />
              ) : (
                <p className="text-muted-foreground text-center py-8">Add accounts to see breakdown</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {!recentTx.length ? (
                <p className="text-muted-foreground text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {recentTx.slice(0, 8).map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{tx.description}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{tx.account.name} • {new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                      <span className={`font-bold ${tx.type === 'INCOME' ? 'text-green-500' : tx.type === 'EXPENSE' ? 'text-destructive' : 'text-blue-500'}`}>
                        {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '↔'}${parseFloat(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Reset */}
        <div className="flex justify-end pt-4">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm('Delete all transactions and accounts?')) {
                resetMutation.mutate()
              }
            }}
          >
            Reset All Data
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}