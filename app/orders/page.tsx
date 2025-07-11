'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Order } from '@/types/order'

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [newOrder, setNewOrder] = useState({
        name: '',
        price: '',
        due_date: '',
        phone: '', // New field
    })

    const [currentPage, setCurrentPage] = useState(1)
    const perPage = 10

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching orders:', error)
        } else {
            setOrders(data as Order[])
        }
        setLoading(false)
    }

    const [searchTerm, setSearchTerm] = useState('')
    const [errors, setErrors] = useState({
        name: '',
        price: '',
        due_date: '',
        phone: '', // New field
    })

    const handleAddOrder = async () => {
        const { name, price, due_date, phone } = newOrder
        const newErrors = { name: '', price: '', due_date: '', phone: '' }

        if (!name) newErrors.name = 'Nama wajib diisi'
        if (!price) newErrors.price = 'Harga wajib diisi'
        if (!due_date) newErrors.due_date = 'Tanggal wajib diisi'
        if (!phone) newErrors.phone = 'Nomor telepon wajib diisi'
        else if (!/^[0-9]{10,15}$/.test(phone)) newErrors.phone = 'Nomor telepon harus 10-15 angka'

        setErrors(newErrors)

        if (newErrors.name || newErrors.price || newErrors.due_date || newErrors.phone) return

        const generatedOrderNumber =
            'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase()

        const { error } = await supabase.from('orders').insert({
            name,
            price: Number(price),
            order_number: generatedOrderNumber,
            due_date,
            status: 'unfinished',
            phone, // New field
        })

        if (error) {
            console.error('Gagal menambahkan order:', error)
        } else {
            setShowModal(false)
            setNewOrder({ name: '', price: '', due_date: '', phone: '' })
            setErrors({ name: '', price: '', due_date: '', phone: '' })
            fetchOrders()
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus order ini?')) return
        const { error } = await supabase.from('orders').delete().eq('id', id)
        if (!error) fetchOrders()
    }

    const handleFinish = async (id: number) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'finished', is_notif_send: false })
            .eq('id', id)

        if (!error) {
            fetchOrders()
        }
    }

    const filteredOrders = orders.filter(order =>
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    )
    const totalPages = Math.ceil(filteredOrders.length / perPage)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-[#00bcd4]">Orders</h2>
                <button
                    className="bg-[#00bcd4] text-black px-4 py-2 rounded hover:bg-[#1de9b6]"
                    onClick={() => setShowModal(true)}
                >
                    + Add Order
                </button>
            </div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama order..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 rounded bg-[#12151c] border border-[#263238] text-white"
                />
            </div>

            <div className="overflow-auto border border-[#263238] rounded-lg shadow">
                <table className="min-w-full border-collapse">
                    <thead className="bg-[#1a1d26] text-[#00bcd4]">
                        <tr>
                            <th className="px-4 py-2 text-left text-white">No</th>
                            <th className="px-4 py-2 text-left text-white">Order No.</th>
                            <th className="px-4 py-2 text-left text-white">Name</th>
                            <th className="px-4 py-2 text-left text-white">Phone</th>
                            <th className="px-4 py-2 text-left text-white">Price</th>
                            <th className="px-4 py-2 text-left text-white">Created At</th>
                            <th className="px-4 py-2 text-left text-white">Due Date</th>
                            <th className="px-4 py-2 text-left text-white">Status</th>
                            <th className="px-4 py-2 text-left text-white">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="text-center p-4 text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedOrders.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center p-4 text-gray-400">
                                    Tidak ada data order.
                                </td>
                            </tr>
                        ) : (
                            paginatedOrders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-[#263238] transition-colors duration-150"
                                >
                                    <td className="px-4 py-2 text-white">
                                        {(currentPage - 1) * perPage + index + 1}
                                    </td>
                                    <td className="px-4 py-2 text-white">{order.order_number}</td>
                                    <td className="px-4 py-2 text-white">{order.name}</td>
                                    <td className="px-4 py-2 text-white">{order.phone}</td>
                                    <td className="px-4 py-2 text-white">
                                        Rp {Number(order.price).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-2 text-white">
                                        {new Date(order.created_at).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-2 text-white">
                                        {order.due_date
                                            ? new Date(order.due_date).toLocaleDateString('id-ID')
                                            : '-'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {order.status === 'finished' ? (
                                            <span className="text-green-400">Finished</span>
                                        ) : (
                                            <span className="text-yellow-400">Unfinished</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 space-x-2">
                                        {order.status === 'unfinished' && (
                                            <button
                                                onClick={() => handleFinish(order.id)}
                                                className="text-blue-400 hover:text-blue-600"
                                            >
                                                Finish
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 mt-4">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1 bg-[#00bcd4] text-black rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="text-white">{currentPage} / {totalPages}</span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1 bg-[#00bcd4] text-black rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-[#1a1d26] text-white p-6 rounded-lg w-full max-w-md shadow-lg border border-[#263238]">
                        <h3 className="text-xl font-bold mb-4 text-[#00bcd4]">Add New Order</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-white">
                                    Nama Order
                                    {errors.name && <span className="text-red-500 ml-2 text-xs">{errors.name}</span>}
                                </label>
                                <input
                                    type="text"
                                    value={newOrder.name}
                                    onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })}
                                    className="w-full p-2 rounded bg-[#12151c] border border-[#263238] text-white"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white">
                                    Harga (Rp)
                                    {errors.price && <span className="text-red-500 ml-2 text-xs">{errors.price}</span>}
                                </label>
                                <input
                                    type="number"
                                    value={newOrder.price}
                                    onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                                    className="w-full p-2 rounded bg-[#12151c] border border-[#263238] text-white"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white">
                                    Nomor Telepon
                                    {errors.phone && <span className="text-red-500 ml-2 text-xs">{errors.phone}</span>}
                                </label>
                                <input
                                    type="tel"
                                    value={newOrder.phone}
                                    onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })}
                                    className="w-full p-2 rounded bg-[#12151c] border border-[#263238] text-white"
                                    pattern="[0-9]{10,15}"
                                    title="Nomor telepon harus 10-15 angka"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-white">
                                    Due Date
                                    {errors.due_date && <span className="text-red-500 ml-2 text-xs">{errors.due_date}</span>}
                                </label>
                                <input
                                    type="date"
                                    value={newOrder.due_date}
                                    onChange={(e) => setNewOrder({ ...newOrder, due_date: e.target.value })}
                                    className="w-full p-2 rounded bg-[#12151c] border border-[#263238] text-white"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                    onClick={() => setShowModal(false)}
                                >
                                    Batal
                                </button>
                                <button
                                    className="bg-[#00bcd4] text-black px-4 py-2 rounded hover:bg-[#1de9b6]"
                                    onClick={handleAddOrder}
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}