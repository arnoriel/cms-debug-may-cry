'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types/order'

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error.message)
    } else {
      setOrders(data as Order[])
    }
  }

  const filteredOrders = orders.filter((order) => {
    const createdAt = new Date(order.created_at)
    return (
      createdAt.getMonth() === selectedMonth &&
      createdAt.getFullYear() === selectedYear
    )
  })

  const totalOrders = orders.length
  const unfinishedOrders = orders.filter((o) => o.status === 'unfinished').length
  const finishedOrders = orders.filter((o) => o.status === 'finished').length
  const totalIncomeThisMonth = filteredOrders.reduce((total, o) => total + Number(o.price), 0)

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#00bcd4]">Dashboard</h2>
      <p className='text-2xs font-bold text-white'>Selamat datang di Dashboard, dan lihat perkembangan Debug May Cry disini</p>

      {/* Dropdown Filter Bulan */}
      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm text-gray-300">Bulan</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="ml-2 p-2 bg-[#12151c] border border-[#263238] text-white rounded"
          >
            {months.map((month, i) => (
              <option key={i} value={i}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-300">Tahun</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="ml-2 p-2 bg-[#12151c] border border-[#263238] text-white rounded w-24"
          />
        </div>
      </div>

      {/* 3 STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1d26] p-4 rounded-lg shadow border border-[#263238]">
          <p className="text-sm text-gray-400">Jumlah Order</p>
          <h3 className="text-2xl font-bold text-[#00bcd4]">{totalOrders}</h3>
        </div>
        <div className="bg-[#1a1d26] p-4 rounded-lg shadow border border-[#263238]">
          <p className="text-sm text-gray-400">Orderan Belum Selesai</p>
          <h3 className="text-2xl font-bold text-yellow-400">{unfinishedOrders}</h3>
        </div>
        <div className="bg-[#1a1d26] p-4 rounded-lg shadow border border-[#263238]">
          <p className="text-sm text-gray-400">Orderan Sudah Selesai</p>
          <h3 className="text-2xl font-bold text-green-400">{finishedOrders}</h3>
        </div>
      </div>

      {/* TOTAL INCOME PER BULAN */}
      <div className="bg-[#1a1d26] p-6 rounded-lg shadow border border-[#263238]">
        <h4 className="text-xl font-semibold mb-2 text-[#00bcd4]">Total Income Bulan Ini</h4>
        <p className="text-3xl font-bold text-green-300">
          Rp {totalIncomeThisMonth.toLocaleString('id-ID')}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Berdasarkan data order bulan {months[selectedMonth]} {selectedYear}
        </p>
      </div>

      {/* STATIC NOTIFICATIONS */}
      <div className="bg-[#1a1d26] p-6 rounded-lg shadow border border-[#263238]">
        <h4 className="text-xl font-semibold mb-2 text-[#00bcd4]">Notifications</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          {/* <li>📦 New order received from Dante.</li>
          <li>🕒 Vergil's delivery due in 3 days.</li> */}
          <li>⚠️ Maintenance update scheduled this weekend.</li>
        </ul>
      </div>
    </div>
  )
}
