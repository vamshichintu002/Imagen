import { Analytics } from "@vercel/analytics/react"
import { IdeogramClone } from "@/components/ideogram-clone"

export default function Page() {
  return (
    <>
      <Analytics />  {/* This line adds the Analytics component */}
      <IdeogramClone />
    </>
  )
}