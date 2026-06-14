import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';
import MapPicker from '../components/MapPicker';
import { Calendar, Clock, Trophy, MapPin, DollarSign, Users, Award, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateMatch = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    ground: '',
    address: '',
    date: '',
    time: '',
    overs: 16,
    playersNeeded: 11,
    skillLevel: 'All',
    ballType: 'Tennis',
    entryFee: 0,
    maxPlayers: 22,
    notes: '',
    isPrivate: false
  });

  const [coords, setCoords] = useState(null); // { lat, lng }
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCoordsChange = (newCoords) => {
    setCoords(newCoords);
    // Auto geocode (simulated geocode ground name or details, or let user set address)
    // We can just set a default address placeholder if address is empty
    if (!form.address) {
      setForm((prev) => ({
        ...prev,
        address: prev.ground ? `${prev.ground}` : 'Selected ground location'
      }));
    }
  };

  const createMatchMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post('/matches', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      navigate(`/matches/${data._id}`);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create match. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!coords) {
      setError('Please pinpoint the ground location on the map below.');
      return;
    }

    const payload = {
      ...form,
      longitude: coords.lng,
      latitude: coords.lat
    };

    createMatchMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Header */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to matches
      </button>

      <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-800 space-y-6">
        <div className="space-y-1">
          <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-emerald-500" /> Host a Cricket Match
          </h1>
          <p className="text-sm text-slate-400">
            Fill in the match details, entry requirements, and place a pin on the map to start gathering players.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Match Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="Sunday Morning Friendly T20 Match"
                value={form.title}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-4 py-3 rounded-xl outline-none transition-all text-xs"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Description / Match Details</label>
              <textarea
                name="description"
                rows={3}
                placeholder="We are looking for friendly players. Ground has good pitch. We will arrange water."
                value={form.description}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-4 py-3 rounded-xl outline-none transition-all text-xs resize-none"
              />
            </div>

            {/* Ground Name */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Ground Name</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="ground"
                  required
                  placeholder="Kanteerava Stadium"
                  value={form.ground}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Street Address / City</label>
              <input
                type="text"
                name="address"
                required
                placeholder="Kasturba Road, Sampangi Rama Nagar, Bangalore"
                value={form.address}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-4 py-3 rounded-xl outline-none transition-all text-xs"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Match Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  name="date"
                  required
                  value={form.date}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs"
                />
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Time</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="time"
                  name="time"
                  required
                  value={form.time}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs"
                />
              </div>
            </div>

            {/* Overs */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Overs</label>
              <input
                type="number"
                name="overs"
                required
                min={1}
                value={form.overs}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-4 py-3 rounded-xl outline-none transition-all text-xs"
              />
            </div>

            {/* Max Players */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Max Squad size</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  name="maxPlayers"
                  required
                  min={2}
                  value={form.maxPlayers}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs"
                />
              </div>
            </div>

            {/* Players Needed */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Players Needed (Vacancies)</label>
              <input
                type="number"
                name="playersNeeded"
                required
                min={0}
                value={form.playersNeeded}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-4 py-3 rounded-xl outline-none transition-all text-xs"
              />
            </div>

            {/* Entry Fee */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Entry Fee (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  name="entryFee"
                  min={0}
                  value={form.entryFee}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs"
                />
              </div>
            </div>

            {/* Ball Type */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Ball Type</label>
              <select
                name="ballType"
                value={form.ballType}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-4 py-3 rounded-xl outline-none transition-all text-xs cursor-pointer"
              >
                <option value="Tennis">Tennis</option>
                <option value="Leather">Leather</option>
              </select>
            </div>

            {/* Skill Level */}
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Target Skill Level</label>
              <div className="relative">
                <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select
                  name="skillLevel"
                  value={form.skillLevel}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 pl-10 pr-4 py-3 rounded-xl outline-none transition-all text-xs cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
            </div>

            {/* Private Toggle */}
            <div className="sm:col-span-2 flex items-center gap-3 bg-slate-950 p-4 border border-slate-900 rounded-xl">
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={form.isPrivate}
                onChange={handleChange}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <label htmlFor="isPrivate" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                Make match private (accessible only via sharing unique ID)
              </label>
            </div>

            {/* Map Picker Component */}
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Pinpoint Ground Location</label>
              <p className="text-[10px] text-slate-500">
                Click/Tap on the map below at the exact ground location so players can navigate correctly.
              </p>
              <MapPicker value={coords} onChange={handleCoordsChange} />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Special Notes / Equipment Requirements</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Bring your own bats. Kits will be provided by the organizer."
                value={form.notes}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-4 py-3 rounded-xl outline-none transition-all text-xs resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createMatchMutation.isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:scale-100 disabled:opacity-50 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            {createMatchMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Create Match'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMatch;
