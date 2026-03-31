import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  Menu, 
  LogOut,
  X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  
  return (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        )
      })}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:text-destructive mt-auto"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </nav>
  )
}

function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const currentPage = navItems.find(item => item.href === pathname)?.label || 'PennyWise'
  
  return (
    <header className="flex items-center gap-4 px-4 py-3 border-b bg-background">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-semibold">{currentPage}</h1>
    </header>
  )
}

function BottomNav() {
  const pathname = usePathname()
  
  return (
    <nav className="flex items-center justify-around border-t bg-background p-2 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on tablet/mobile */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:border-r bg-card">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">PennyWise</h1>
        </div>
        <Sidebar />
      </aside>
      
      {/* Mobile/Sheet Menu */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6 border-b flex items-center justify-between">
            <h1 className="text-xl font-bold">PennyWise</h1>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <Sidebar onClose={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Tablet Top Nav - hidden on desktop/mobile */}
        <div className="hidden md:block lg:hidden">
          <TopNav onMenuClick={() => setMobileMenuOpen(true)} />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
        
        {/* Mobile Bottom Nav - hidden on tablet/desktop */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}