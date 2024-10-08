'use client'

import { useState, useEffect } from 'react'
import { Bell, Home, Image as ImageIcon, Menu, Zap, UserPlus } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import LoginPage from './login' // Import the LoginPage component
import { storage } from '../lib/firebase'
import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { User } from 'firebase/auth' // Add this import

export function IdeogramClone() {
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false) // New state to control login visibility
  const [user, setUser] = useState<User | null>(null) // Update this line

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const generateImage = async () => {
    setIsLoading(true)
    setError(null)
    setGeneratedImage(null)

    if (!user) {
      setError('Please log in to generate and save images.')
      setIsLoading(false)
      return
    }

    try {
      console.log('Sending request to Hugging Face API')
      const response = await fetch("https://api-inference.huggingface.co/models/XLabs-AI/flux-RealismLora", {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      })

      console.log('API response received:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      console.log('Blob created, size:', blob.size)

      // Convert blob to base64
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64data = reader.result as string

        // Upload to Firebase Storage
        const imageName = `generated_${Date.now()}.jpg`
        const storageRef = ref(storage, `images/${imageName}`)
        
        try {
          await uploadString(storageRef, base64data, 'data_url')
          console.log('Image uploaded to Firebase Storage')

          // Get download URL
          const downloadURL = await getDownloadURL(storageRef)
          console.log('Download URL:', downloadURL)

          setGeneratedImage(downloadURL)
        } catch (error) {
          console.error('Error uploading to Firebase:', error)
          setError('Failed to upload image to storage. Please try again.')
        }
      }
    } catch (err) {
      console.error('Error generating image:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {showLogin ? (
        <LoginPage onClose={() => setShowLogin(false)} />
      ) : (
        <>
          <header className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl md:text-2xl font-bold">ideogram</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <Zap className="h-5 w-5" />
                <span className="sr-only">Upgrade plan</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Button>
              <Button variant="ghost" size="icon">
                <ImageIcon className="h-5 w-5" />
                <span className="sr-only">Images</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
              {/* Updated Login/Signup Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => setShowLogin(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Login / Signup
              </Button>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-6">What will you create?</h2>
            <div className="flex flex-col md:flex-row mb-8 gap-2 md:gap-0">
              <Input
                className="flex-grow rounded-full md:rounded-l-full md:rounded-r-none bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                placeholder="Describe what you want to see"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button 
                className="w-full md:w-auto rounded-full md:rounded-l-none md:rounded-r-full"
                onClick={generateImage}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
            </div>
            {error && (
              <div className="text-red-500 mb-4">{error}</div>
            )}
            <nav className="flex flex-wrap gap-2 mb-8">
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm md:text-base">
                Explore
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm md:text-base">
                My images
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm md:text-base">
                All
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm md:text-base">
                Realistic
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm md:text-base">
                Design
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm md:text-base">
                3D
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white text-sm md:text-base">
                Anime
              </Button>
            </nav>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImage ? (
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden col-span-1 md:col-span-2 lg:col-span-3 max-w-2xl mx-auto">
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=300&width=300`}
                        alt="Placeholder image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  )
}