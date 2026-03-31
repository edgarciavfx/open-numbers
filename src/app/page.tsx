import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">PennyWise</h1>
        <p className="text-gray-400 mb-8">Liquidity control made simple</p>
        <div className="space-x-4">
          <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}