'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isRegister) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Registration failed')
        return
      }
      
      setIsRegister(false)
      setError('Account created! Please sign in.')
    } else {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (res?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {isRegister ? 'Create Account' : 'PennyWise'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
          >
            {isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-gray-400 text-sm">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            className="text-blue-400 hover:underline"
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}