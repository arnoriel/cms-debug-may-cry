'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Settings = {
    id?: string
    site_title: string
    tagline: string
    logo_url: string
    hero_name: string
    hero_image: string
    hero_description: string
    about_description: string
    trusted_title: string
    trusted_description: string
    location: string
    phone: string
    email: string
    audio_title: string
    audio_src: string
    audio_button_text: string
}


export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState<Settings | null>(null)

    const [form, setForm] = useState<Settings>({
        site_title: '',
        tagline: '',
        logo_url: '',
        hero_name: '',
        hero_image: '',
        hero_description: '',
        about_description: '',
        trusted_title: '',
        trusted_description: '',
        location: '',
        phone: '',
        email: '',
        audio_title: '',
        audio_src: '',
        audio_button_text: '',
    })


    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('settings')
                .select('*')
                .limit(1)
                .single()

            if (data) {
                setSettings(data)
                setForm(data)
            }

            setLoading(false)
        }

        fetchSettings()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (settings?.id) {
            await supabase.from('settings').update(form).eq('id', settings.id)
            alert('Settings updated!')
        } else {
            const { data, error } = await supabase.from('settings').insert([form])
            if (!error) {
                alert('Settings created!')
                setSettings(data)
            }
        }
    }

    if (loading) return <p className="p-4">Loading...</p>

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-white">CMS Settings</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm mb-1 text-gray-300">Site Title</label>
                    <input
                        type="text"
                        name="site_title"
                        value={form.site_title}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Tagline</label>
                    <input
                        type="text"
                        name="tagline"
                        value={form.tagline}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Logo URL</label>
                    <input
                        type="text"
                        name="logo_url"
                        value={form.logo_url}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Hero Name</label>
                    <input
                        type="text"
                        name="hero_name"
                        value={form.hero_name}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Hero Image URL</label>
                    <input
                        type="text"
                        name="hero_image"
                        value={form.hero_image}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Hero Description</label>
                    <textarea
                        name="hero_description"
                        value={form.hero_description}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">About Description</label>
                    <textarea
                        name="about_description"
                        value={form.about_description || ''}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Trusted Title</label>
                    <input
                        type="text"
                        name="trusted_title"
                        value={form.trusted_title || ''}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Trusted Description</label>
                    <textarea
                        name="trusted_description"
                        value={form.trusted_description || ''}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={form.location || ''}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={form.phone || ''}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email || ''}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Audio Title</label>
                    <input
                        type="text"
                        name="audio_title"
                        value={form.audio_title || ''}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Audio Source URL</label>
                    <input
                        type="text"
                        name="audio_src"
                        value={form.audio_src || ''}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-gray-300">Audio Button Text</label>
                    <input
                        type="text"
                        name="audio_button_text"
                        value={form.audio_button_text || ''}
                        onChange={handleChange}
                        className="w-full p-2 bg-[#1e1e2e] text-white rounded"
                    />
                </div>
                 <button
                    type="submit"
                    className="px-4 py-2 bg-[#00bcd4] text-black font-semibold rounded hover:bg-cyan-400"
                >
                    {settings?.id ? 'Update Settings' : 'Create Settings'}
                </button>
            </form>
        </div>
    )
}
