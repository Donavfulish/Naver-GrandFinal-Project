import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] border-t border-[#2A2A2A] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-[#F5F5F5] font-semibold mb-4">
              Aura<span className="text-[#C7A36B]">Space</span>
            </h3>
            <p className="text-[#B3B3B3] text-sm">Design your mood. Live your space.</p>
          </div>
          <div>
            <h4 className="text-[#F5F5F5] font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-[#B3B3B3] hover:text-[#C7A36B] transition text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/generate" className="text-[#B3B3B3] hover:text-[#C7A36B] transition text-sm">
                  AI Generator
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#F5F5F5] font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[#B3B3B3] hover:text-[#C7A36B] transition text-sm">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-[#B3B3B3] hover:text-[#C7A36B] transition text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#F5F5F5] font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[#B3B3B3] hover:text-[#C7A36B] transition text-sm">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-[#B3B3B3] hover:text-[#C7A36B] transition text-sm">
                  Privacy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#2A2A2A] pt-8 text-center text-[#B3B3B3] text-sm">
          <p>&copy; 2025 AuraSpace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
