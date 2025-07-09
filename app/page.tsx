'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types/order'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [toast, setToast] = useState<string | null>(null)
  const [notifPage, setNotifPage] = useState(1)
  const notifPerPage = 5
  const [notifOrders, setNotifOrders] = useState<Order[]>([])
  const [chartType, setChartType] = useState<'daily' | 'monthly' | 'yearly'>('daily')
  const [chartData, setChartData] = useState<{ label: string; total: number }[]>([])
  const [incomeChangePercent, setIncomeChangePercent] = useState<number | null>(null)
  const [isIncrease, setIsIncrease] = useState<boolean | null>(null)

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

      const notifs = (data as Order[]).filter(
        o => o.status === 'unfinished' && o.is_notif_send
      )

      setNotifOrders(notifs)
    }
  }

  const handleFinishNotif = async (id: number) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'finished', is_notif_send: false })
      .eq('id', id)

    if (!error) {
      setToast('Orderan berhasil diselesaikan!')
      fetchOrders()
    }
  }

  const handleCancelNotif = async (id: number) => {
    const { error } = await supabase.from('orders').delete().eq('id', id)

    if (!error) {
      setToast('Orderan berhasil dibatalkan!')
      fetchOrders()
    }
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

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

  useEffect(() => {
    const grouped: Record<string, number> = {}

    orders.forEach(order => {
      const createdAt = new Date(order.created_at)
      let key = ''

      if (chartType === 'daily') {
        key = createdAt.toLocaleDateString('id-ID') // misal: "9/7/2025"
      } else if (chartType === 'monthly') {
        key = `${createdAt.getMonth() + 1}/${createdAt.getFullYear()}`
      } else if (chartType === 'yearly') {
        key = `${createdAt.getFullYear()}`
      }

      if (!grouped[key]) grouped[key] = 0
      grouped[key] += Number(order.price)
    })

    const data = Object.entries(grouped)
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => {
        const [da, ma, ya] = a.label.split('/').map(Number)
        const [db, mb, yb] = b.label.split('/').map(Number)

        const dateA = new Date(chartType === 'yearly' ? a.label : `${ya || ma || 0}-${ma || da || 1}-${da || 1}`)
        const dateB = new Date(chartType === 'yearly' ? b.label : `${yb || mb || 0}-${mb || db || 1}-${db || 1}`)

        return dateA.getTime() - dateB.getTime()
      })

    setChartData(data)
  }, [orders, chartType])

  useEffect(() => {
    if (chartData.length >= 2) {
      const prev = chartData[chartData.length - 2].total
      const current = chartData[chartData.length - 1].total

      if (prev === 0) {
        setIncomeChangePercent(null)
        setIsIncrease(null)
      } else {
        const percent = ((current - prev) / prev) * 100
        setIncomeChangePercent(Math.abs(percent))
        setIsIncrease(current >= prev)
      }
    }
  }, [chartData])

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

      <div className="bg-[#1a1d26] p-6 rounded-lg shadow border border-[#263238]">
        <h4 className="text-xl font-semibold mb-2 text-[#00bcd4]">Notifications</h4>

        {notifOrders.length === 0 ? (
          <p className="text-sm text-gray-400">Tidak ada notifikasi order baru.</p>
        ) : (
          <>
            <ul className="space-y-2 text-sm text-gray-300">
              {notifOrders
                .slice((notifPage - 1) * notifPerPage, notifPage * notifPerPage)
                .map((o) => (
                  <li
                    key={o.id}
                    className="flex justify-between items-center bg-[#12151c] p-3 rounded border border-[#263238]"
                  >
                    <span>
                      🛒 Orderan Baru: <strong>{o.name}</strong>, Rp {Number(o.price).toLocaleString('id-ID')}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFinishNotif(o.id)}
                        className="bg-green-500 text-black px-3 py-1 rounded hover:bg-green-400 text-sm"
                      >
                        Selesaikan
                      </button>
                      <button
                        onClick={() => handleCancelNotif(o.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400 text-sm"
                      >
                        Batalkan
                      </button>
                    </div>
                  </li>
                ))}
            </ul>

            {/* Pagination */}
            {notifOrders.length > notifPerPage && (
              <div className="flex justify-end items-center gap-2 mt-4">
                <button
                  disabled={notifPage === 1}
                  onClick={() => setNotifPage(notifPage - 1)}
                  className="px-2 py-1 bg-[#00bcd4] text-black rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-white text-sm">
                  {notifPage} / {Math.ceil(notifOrders.length / notifPerPage)}
                </span>
                <button
                  disabled={notifPage === Math.ceil(notifOrders.length / notifPerPage)}
                  onClick={() => setNotifPage(notifPage + 1)}
                  className="px-2 py-1 bg-[#00bcd4] text-black rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50 animate-bounce-in">
          {toast}
        </div>
      )}

      <div className="bg-[#1a1d26] p-6 rounded-lg shadow border border-[#263238]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-[#00bcd4]">Grafik Pertumbuhan Pendapatan</h4>
          {incomeChangePercent !== null && (
            <span className={`text-sm font-bold ${isIncrease ? 'text-green-400' : 'text-red-400'}`}>
              {isIncrease ? '▲' : '▼'} {incomeChangePercent.toFixed(2)}%
            </span>
          )}
        </div>
        <div className="flex gap-4 mb-4">
          <button
            className={`px-3 py-1 rounded ${chartType === 'daily' ? 'bg-[#00bcd4] text-black' : 'bg-[#263238] text-white'}`}
            onClick={() => setChartType('daily')}
          >
            Harian
          </button>
          <button
            className={`px-3 py-1 rounded ${chartType === 'monthly' ? 'bg-[#00bcd4] text-black' : 'bg-[#263238] text-white'}`}
            onClick={() => setChartType('monthly')}
          >
            Bulanan
          </button>
          <button
            className={`px-3 py-1 rounded ${chartType === 'yearly' ? 'bg-[#00bcd4] text-black' : 'bg-[#263238] text-white'}`}
            onClick={() => setChartType('yearly')}
          >
            Tahunan
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#37474f" />
            <XAxis
              dataKey="label"
              stroke="#00bcd4"
              tick={false}
            />
            <YAxis
              stroke="#00bcd4"
              domain={['auto', 'auto']}
              tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#263238', borderColor: '#00bcd4', color: '#fff' }}
              formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#00bcd4"
              strokeWidth={2}
              dot={{ stroke: '#00bcd4', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
