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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, ArrowRightLeft, TrendingUp, TrendingDown, ArrowLeftRight, Receipt } from 'lucide-react'

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
  const [formData, setFormData] = useState({
    accountId: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    amount: '',
    description: ''
  })
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
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setFormData({ accountId: '', type: 'EXPENSE', amount: '', description: '' })
      toast.success('Transaction added')
    },
    onError: () => toast.error('Failed to add transaction')
  })

  const transferMutation = useMutation({
    mutationFn: () => fetch('/api/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromAccountId: transferData.fromAccountId,
        toAccountId: transferData.toAccountId,
        amount: parseFloat(transferData.amount),
        description: transferData.description
      })
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setTransferData({ fromAccountId: '', toAccountId: '', amount: '', description: '' })
      toast.success('Transfer complete')
    },
    onError: () => toast.error('Transfer failed')
  })

  if (status === 'loading') return <AppLayout><div className="p-8">Loading...</div></AppLayout>
  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Record income, expenses, and transfers</p>
        </div>

        <Tabs defaultValue="transaction">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="transaction">
              <Receipt className="h-4 w-4 mr-2" />
              Transaction
            </TabsTrigger>
            <TabsTrigger value="transfer">
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Transfer
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transaction" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(v) => v && setFormData({ ...formData, type: v as 'INCOME' | 'EXPENSE' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXPENSE">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                            Expense
                          </div>
                        </SelectItem>
                        <SelectItem value="INCOME">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Income
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="What for?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  className="mt-4" 
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !formData.accountId || !formData.amount}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {createMutation.isPending ? 'Saving...' : 'Save Transaction'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transfer" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Money</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Select value={transferData.fromAccountId} onValueChange={(v) => v && setTransferData({ ...transferData, fromAccountId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name} (${parseFloat(a.balance).toFixed(2)})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Select value={transferData.toAccountId} onValueChange={(v) => v && setTransferData({ ...transferData, toAccountId: v })}>
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
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Optional"
                      value={transferData.description}
                      onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  className="mt-4"
                  onClick={() => transferMutation.mutate()}
                  disabled={transferMutation.isPending || !transferData.fromAccountId || !transferData.toAccountId || !transferData.amount}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  {transferMutation.isPending ? 'Transferring...' : 'Transfer'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No transactions yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{tx.description}</TableCell>
                      <TableCell className="text-muted-foreground">{tx.account.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 ${
                          tx.type === 'INCOME' ? 'text-green-500' : 
                          tx.type === 'EXPENSE' ? 'text-destructive' : 'text-blue-500'
                        }`}>
                          {tx.type === 'INCOME' && <TrendingUp className="h-4 w-4" />}
                          {tx.type === 'EXPENSE' && <TrendingDown className="h-4 w-4" />}
                          {tx.type === 'TRANSFER' && <ArrowRightLeft className="h-4 w-4" />}
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        tx.type === 'INCOME' ? 'text-green-500' : 
                        tx.type === 'EXPENSE' ? 'text-destructive' : 'text-blue-500'
                      }`}>
                        {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '↔'}
                        ${parseFloat(tx.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}