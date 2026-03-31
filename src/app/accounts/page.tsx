'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Wallet, CreditCard, Gift, Trash2, Building2 } from 'lucide-react'

interface Account {
  id: string
  name: string
  type: 'DEBIT' | 'CREDIT' | 'VOUCHER'
  balance: string
  cutDay: number | null
  payDay: number | null
}

const typeConfig = {
  DEBIT: { label: 'Debit (Cash/Bank)', icon: Building2, color: 'text-green-500' },
  CREDIT: { label: 'Credit Card', icon: CreditCard, color: 'text-red-500' },
  VOUCHER: { label: 'Voucher (Prepaid)', icon: Gift, color: 'text-yellow-500' }
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setShowForm(false)
      setFormData({ name: '', type: 'DEBIT', balance: 0 })
      toast.success('Account created')
    },
    onError: () => {
      toast.error('Failed to create account')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/accounts/${id}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Account deleted')
    },
    onError: () => {
      toast.error('Failed to delete account')
    }
  })

  if (status === 'loading') return <AppLayout><div className="p-8">Loading...</div></AppLayout>
  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Accounts</h1>
            <p className="text-muted-foreground">Manage your accounts</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Account
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    placeholder="e.g., Bank of America"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => v && setFormData({ ...formData, type: v as 'DEBIT' | 'CREDIT' | 'VOUCHER' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DEBIT">Debit (Cash/Bank)</SelectItem>
                      <SelectItem value="CREDIT">Credit Card</SelectItem>
                      <SelectItem value="VOUCHER">Voucher (Prepaid)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Initial Balance</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button 
                    onClick={() => createMutation.mutate(formData)}
                    disabled={createMutation.isPending || !formData.name}
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
              {formData.type === 'CREDIT' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Use negative for debt (e.g., -500)
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No accounts yet</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first account
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const config = typeConfig[account.type]
              const Icon = config.icon
              return (
                <Card key={account.id} className="relative overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div>
                          <p className="font-semibold">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{config.label}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm('Delete this account?')) {
                            deleteMutation.mutate(account.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className={`text-2xl font-bold ${parseFloat(account.balance) < 0 ? 'text-destructive' : 'text-green-500'}`}>
                      ${parseFloat(account.balance).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}