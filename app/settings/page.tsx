'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Settings = {
  id?: string;
  site_title: string;
  tagline: string;
  logo_url: string;
  hero_name: string;
  hero_image: string;
  hero_description: string;
  about_description: string;
  trusted_title: string;
  trusted_description: string;
  location: string;
  phone: string;
  email: string;
  audio_title: string;
  audio_src: string;
  audio_button_text: string;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
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
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setSettings(data);
        setForm(data);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'heroImage' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === 'logo') setLogoFile(file);
      if (field === 'heroImage') setHeroImageFile(file);
      if (field === 'audio') setAudioFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedForm = { ...form };

    // Upload logo file
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('logos')
        .upload(fileName, logoFile);
      if (error) {
        alert('Failed to upload logo: ' + error.message);
        setLoading(false);
        return;
      }
      updatedForm.logo_url = `logos/${fileName}`;
    }

    // Upload hero image
    if (heroImageFile) {
      const fileExt = heroImageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('hero-images')
        .upload(fileName, heroImageFile);
      if (error) {
        alert('Failed to upload hero image: ' + error.message);
        setLoading(false);
        return;
      }
      updatedForm.hero_image = `hero-images/${fileName}`;
    }

    // Upload audio file
    if (audioFile) {
      const fileExt = audioFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('audio-files')
        .upload(fileName, audioFile);
      if (error) {
        alert('Failed to upload audio: ' + error.message);
        setLoading(false);
        return;
      }
      updatedForm.audio_src = `audio-files/${fileName}`;
    }

    // Update or insert settings
    if (settings?.id) {
      const { error } = await supabase
        .from('settings')
        .update(updatedForm)
        .eq('id', settings.id);
      if (error) {
        alert('Failed to update settings: ' + error.message);
      } else {
        alert('Settings updated!');
        setSettings(updatedForm);
      }
    } else {
      const { data, error } = await supabase
        .from('settings')
        .insert([updatedForm])
        .select()
        .single();
      if (error) {
        alert('Failed to create settings: ' + error.message);
      } else {
        alert('Settings created!');
        setSettings(data);
      }
    }

    setLoading(false);
  };

  if (loading) return <p className="p-4 text-white bg-[#0B0B0B] min-h-screen flex items-center justify-center">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">CMS Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-gray-300">Site Title</label>
          <input
            type="text"
            name="site_title"
            value={form.site_title}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Tagline</label>
          <input
            type="text"
            name="tagline"
            value={form.tagline}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Logo File</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'logo')}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
          {form.logo_url && (
            <p className="text-sm text-gray-400 mt-1">Current: {form.logo_url}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Hero Name</label>
          <input
            type="text"
            name="hero_name"
            value={form.hero_name}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Hero Image File</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'heroImage')}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
          {form.hero_image && (
            <p className="text-sm text-gray-400 mt-1">Current: {form.hero_image}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Hero Description</label>
          <textarea
            name="hero_description"
            value={form.hero_description}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">About Description</label>
          <textarea
            name="about_description"
            value={form.about_description || ''}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Trusted Title</label>
          <input
            type="text"
            name="trusted_title"
            value={form.trusted_title || ''}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Trusted Description</label>
          <textarea
            name="trusted_description"
            value={form.trusted_description || ''}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Location</label>
          <input
            type="text"
            name="location"
            value={form.location || ''}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone || ''}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={form.email || ''}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Audio Title</label>
          <input
            type="text"
            name="audio_title"
            value={form.audio_title || ''}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Audio File</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleFileChange(e, 'audio')}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
          {form.audio_src && (
            <p className="text-sm text-gray-400 mt-1">Current: {form.audio_src}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Audio Button Text</label>
          <input
            type="text"
            name="audio_button_text"
            value={form.audio_button_text || ''}
            onChange={handleTextChange}
            className="w-full p-2 bg-[#1e1e2e] text-white rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#00bcd4] text-black font-semibold rounded hover:bg-cyan-400 disabled:opacity-50"
        >
          {settings?.id ? 'Update Settings' : 'Create Settings'}
        </button>
      </form>
    </div>
  );
}
