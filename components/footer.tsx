import Link from "next/link"
import { Brain } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          <span className="font-bold">Locali</span>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-sm hover:underline underline-offset-4">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm hover:underline underline-offset-4">
            Privacy
          </Link>
          <Link href="/contact" className="text-sm hover:underline underline-offset-4">
            Contact
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Locali. All rights reserved.</p>
      </div>
    </footer>
  )
}

