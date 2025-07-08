'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const navItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Orders', href: '/orders' },
  { name: 'Settings', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="h-screen w-60 bg-[#0f0f1b] text-[#e0e0e0] border-r border-[#263238] p-4">
      <div className="mb-6">
        <p className="text-lg font-semibold text-[#00bcd4]">Navigation</p>
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={clsx(
                'block px-4 py-2 rounded-md transition-colors',
                pathname === item.href
                  ? 'bg-[#263238] text-[#00bcd4]'
                  : 'hover:bg-[#1a1a2e]'
              )}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
