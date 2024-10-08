'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth } from '../lib/firebase'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

interface LoginPageProps {
  isSignup: boolean;
  onClose: () => void;
  onToggleMode: () => void;
}

export default function LoginPage({ isSignup, onClose, onToggleMode }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isSignup) {
        // Signup logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: name })
        }
      } else {
        // Login logic
        await signInWithEmailAndPassword(auth, email, password)
      }
      router.push('/') // Redirect to home page after successful login/signup
      onClose()
    } catch (error) {
      setError(isSignup ? 'Failed to create an account. Please try again.' : 'Failed to log in. Please check your credentials and try again.')
      console.error(error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/') // Redirect to home page after successful login
      onClose()
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.')
      console.error(error)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-gray-900 p-8 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Imagen By Vamshi</h1>
        <h2 className="mt-6 text-2xl font-bold text-white">{isSignup ? 'Create your account' : 'Sign in to your account'}</h2>
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {isSignup && (
          <div>
            <Label htmlFor="name" className="text-white">Full Name</Label>
            <Input 
              id="name" 
              name="name" 
              type="text" 
              autoComplete="name" 
              required 
              className="mt-1 bg-gray-800 border-gray-700 text-white" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        <div>
          <Label htmlFor="email" className="text-white">Email address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            required 
            className="mt-1 bg-gray-800 border-gray-700 text-white" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-white">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            autoComplete={isSignup ? "new-password" : "current-password"} 
            required 
            className="mt-1 bg-gray-800 border-gray-700 text-white" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {!isSignup && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">Remember me</label>
            </div>
            <div className="text-sm">
              <Link href="#" className="font-medium text-indigo-400 hover:text-indigo-300">Forgot your password?</Link>
            </div>
          </div>
        )}
        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          {isSignup ? 'Sign up' : 'Sign in'}
        </Button>
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full text-black border-gray-700 hover:bg-gray-800">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_13183_10121)"><path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z" fill="#3F83F8"/><path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z" fill="#34A853"/><path d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z" fill="#FBBC04"/><path d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z" fill="#EA4335"/></g><defs><clipPath id="clip0_13183_10121"><rect width="20" height="20" fill="white" transform="translate(0.5)"/></clipPath></defs>
            </svg>
            Sign {isSignup ? 'up' : 'in'} with Google
          </Button>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={onToggleMode} className="font-medium text-indigo-400 hover:text-indigo-300">
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}