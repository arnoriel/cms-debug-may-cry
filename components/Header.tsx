'use client'

export default function Header() {
  return (
    <header className="w-full bg-[#1c1c2e] text-[#00bcd4] p-4 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold">Debug May Cry</h1>

      {/* Profile Statis */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-semibold text-white">Azriel</p>
          <p className="text-xs text-white opacity-50">Bug Hunter</p>
        </div>
        <img
          src="https://ui-avatars.com/api/?name=Azriel&background=1c1c2e&color=00bcd4&rounded=true"
          alt="Profile"
          className="w-10 h-10 rounded-full border border-[#00bcd4]"
        />
      </div>
    </header>
  )
}
