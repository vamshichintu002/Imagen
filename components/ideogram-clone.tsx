'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Download, Github, Linkedin, Instagram } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import LoginPage from './login' // Import the LoginPage component
import { storage, auth } from '../lib/firebase'
import { ref, uploadString, getDownloadURL, listAll, getMetadata } from 'firebase/storage'
import { onAuthStateChanged, User, signOut } from 'firebase/auth' // Add this import
import Image from 'next/image'

interface ImageWithDownloadProps {
  src: string
  alt: string
}

function ImageWithDownload({ src, alt }: ImageWithDownloadProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Extract the image path from the src URL
      const imagePath = src.split('/o/')[1].split('?')[0]
      const decodedPath = decodeURIComponent(imagePath)
      
      // Create a reference to the file in Firebase Storage
      const storageRef = ref(storage, decodedPath)
      
      // Get the download URL
      const url = await getDownloadURL(storageRef)
      
      // Open the image in a new tab
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error opening image:', error)
    }
  }

  return (
    <div 
      className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      {isHovered && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white hover:bg-opacity-20"
            onClick={handleDownload}
          >
            <Download className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}

// Add this new component
const PlaceholderImage = () => (
  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
)

export function IdeogramClone() {
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoginSignup, setShowLoginSignup] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [user, setUser] = useState<User | null>(null) // Update this line
  const [exploreImages, setExploreImages] = useState<string[]>([])
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    // Fetch images when component mounts
    fetchExploreImages()

    return () => unsubscribe()
  }, [])

  const generateImage = async () => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedImage(null)

    try {
      console.log('Sending request to Hugging Face API')
      const response = await fetch("https://api-inference.huggingface.co/models/XLabs-AI/flux-RealismLora", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API}`, 
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

          // Fetch explore images instead of refreshing the page
          await fetchExploreImages()
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

  const fetchExploreImages = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const imagesRef = ref(storage, 'images')
      const result = await listAll(imagesRef)
      
      const imagePromises = result.items.map(async (item) => {
        const metadata = await getMetadata(item)
        const url = await getDownloadURL(item)
        return {
          url,
          timeCreated: metadata.timeCreated,
          name: item.name
        }
      })

      const images = await Promise.all(imagePromises)

      // Sort images by creation time (latest first)
      const sortedImages = images.sort((a, b) => {
        return new Date(b.timeCreated).getTime() - new Date(a.timeCreated).getTime()
      })

      const imageUrls = sortedImages.map(image => image.url)
      setExploreImages(imageUrls)
    } catch (err) {
      console.error('Error fetching images:', err)
      setError('Failed to fetch images. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      alert('You have successfully logged out') // Add this line
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Failed to log out. Please try again.') // Add this line for error handling
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl md:text-2xl font-bold">
            <code>Imagen By Vamshi</code>
          </h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Replace the existing buttons with your social media links */}
          <a href="https://github.com/vamshichintu002/vamshichintu002" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </a>
          <a href="https://www.linkedin.com/in/sudulavamshi/" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </a>
          <a href="https://www.instagram.com/vamshichintu02/" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Button>
          </a>
          {user ? (
            // Show Logout button when user is signed in
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-white text-black hover:bg-gray-200"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            // Show Login/Signup button when user is not signed in
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2 bg-white text-black hover:bg-gray-200"
              onClick={() => {
                setShowLoginSignup(true)
                setIsSignup(false)
              }}
            >
              <UserPlus className="h-4 w-4 mr-2 text-black" />
              Login / Signup
            </Button>
          )}
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
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-white text-sm md:text-base"
            onClick={fetchExploreImages}
          >
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
          {isLoading ? (
            // Show loading placeholder while images are being fetched
            [...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-full bg-gray-700"></div>
              </div>
            ))
          ) : exploreImages.length > 0 ? (
            // Show fetched images
            exploreImages.map((imageUrl, index) => (
              <ImageWithDownload
                key={index}
                src={imageUrl}
                alt={`Explored image ${index + 1}`}
              />
            ))
          ) : generatedImage ? (
            // Show generated image if available
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden col-span-1 md:col-span-2 lg:col-span-3 max-w-2xl mx-auto">
              <ImageWithDownload
                src={generatedImage}
                alt="Generated image"
              />
            </div>
          ) : (
            // Show placeholder if no images are available
            [...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                <PlaceholderImage />
              </div>
            ))
          )}
        </div>
      </main>

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Sign in required</h2>
            <p className="mb-4">Please sign in to generate images.</p>
            <div className="flex justify-end space-x-4">
              <Button variant="ghost" onClick={() => setShowLoginPrompt(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowLoginPrompt(false)
                setShowLoginSignup(true)
                setIsSignup(false)
              }}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}

      {showLoginSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <LoginPage 
              isSignup={isSignup}
              onClose={() => setShowLoginSignup(false)}
              onToggleMode={() => setIsSignup(!isSignup)}
            />
          </div>
        </div>
      )}
    </div>
  )
}