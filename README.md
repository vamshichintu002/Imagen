# Imagen By Vamshi

Imagen By Vamshi is a Next.js-based web application that allows users to generate and explore AI-created images. This project combines the power of AI image generation with a user-friendly interface, making it easy for users to create and share unique images.

## Features

- **AI Image Generation**: Users can input text prompts to generate custom images using advanced AI models.
- **User Authentication**: Secure login and signup functionality, including Google Sign-In option.
- **Image Exploration**: Browse through a gallery of AI-generated images created by the community.
- **Image Download**: Easy-to-use interface for downloading generated images.
- **Responsive Design**: Fully responsive web design that works seamlessly on desktop and mobile devices.

## Technologies Used

- **Next.js**: React framework for building the user interface
- **TypeScript**: For type-safe code
- **Firebase**: Authentication and image storage
- **Tailwind CSS**: For styling and responsive design
- **Hugging Face API**: For AI image generation

## Getting Started

1. Clone the repository:   ```
   git clone https://github.com/your-username/img-gen.git
   cd img-gen   ```

2. Install dependencies:   ```
   npm install   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   NEXT_PUBLIC_HUGGINGFACE_API=your_huggingface_api_key   ```

4. Run the development server:   ```
   npm run dev   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


