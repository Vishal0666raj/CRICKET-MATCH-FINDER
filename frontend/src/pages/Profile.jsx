import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, ShieldAlert, Award, Star, Settings, Check, Edit2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    profilePicture: user?.profilePicture || '',
    bio: user?.bio || '',
    age: user?.age || '',
    gender: user?.gender || 'Prefer not to say',
    city: user?.city || '',
    state: user?.state || '',
    preferredPosition: user?.preferredPosition || 'All-rounder',
    skillLevel: user?.skillLevel || 'Intermediate',
    battingStyle: user?.battingStyle || 'Right Hand',
    bowlingStyle: user?.bowlingStyle || 'Medium'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const res = await updateProfile({
      ...form,
      age: form.age ? parseInt(form.age) : undefined
    });
    setLoading(false);

    if (res.success) {
      setMessage('Profile updated successfully!');
      setEditMode(false);
    } else {
      setError(res.message);
    }
  };

  const statCards = [
    { label: 'Matches Played', value: user?.statistics?.matchesPlayed || 0, color: 'text-emerald-400' },
    { label: 'Wins', value: user?.statistics?.wins || 0, color: 'text-amber-400' },
    { label: 'Runs Scored', value: user?.statistics?.runs || 0, color: 'text-blue-400' },
    { label: 'Wickets Taken', value: user?.statistics?.wickets || 0, color: 'text-red-400' },
    { label: 'Batting Avg', value: user?.statistics?.average || 0, color: 'text-indigo-400' },
    { label: 'Strike Rate', value: user?.statistics?.strikeRate || 0, color: 'text-purple-400' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Avatar & Info Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 text-center space-y-4">
            <div className="relative w-28 h-28 mx-auto">
              <img
                src={user?.profilePicture}
                alt={user?.name}
                className="w-full h-full rounded-full border-2 border-slate-700 object-cover"
              />
              <span className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-slate-950 text-slate-950 p-1 rounded-full text-xs font-bold font-mono">
                {user?.statistics?.rating?.toFixed(1) || '5.0'} ★
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="font-outfit text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-xs text-slate-400">@{user?.username}</p>
              {user?.city && (
                <p className="text-xs text-slate-500">{user.city}, {user.state}</p>
              )}
            </div>

            <p className="text-xs text-slate-400 italic">
              {user?.bio || '"No bio written yet. Let players know who you are!"'}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between text-left text-[11px] text-slate-400">
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Position</p>
                <p className="font-bold text-slate-300">{user?.preferredPosition}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Skill Level</p>
                <p className="font-bold text-slate-300">{user?.skillLevel}</p>
              </div>
            </div>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>

          {/* Attendance and Rating Card */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="font-outfit font-bold text-sm text-slate-200">Quality Indicators</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Attendance Reliability</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {user?.statistics?.attendancePercentage || 100}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${user?.statistics?.attendancePercentage || 100}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Ratings Count</span>
                <span className="font-bold text-slate-300">
                  {user?.statistics?.ratingsCount || 0} reviews
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form or Stats View */}
        <div className="md:col-span-2 space-y-6">
          {editMode ? (
            // Edit Profile Form Card
            <div className="p-6 sm:p-8 rounded-2xl glass-panel border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-outfit text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" /> Edit Profile Settings
                </h3>
                <button
                  onClick={() => setEditMode(false)}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Username</label>
                    <input
                      type="text"
                      name="username"
                      required
                      value={form.username}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  {/* Profile Pic URL */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Profile Picture URL</label>
                    <input
                      type="text"
                      name="profilePicture"
                      placeholder="https://..."
                      value={form.profilePicture}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  {/* Bio */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Short Bio</label>
                    <textarea
                      name="bio"
                      rows={2}
                      value={form.bio}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs resize-none"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">City</label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">State</label>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs"
                    />
                  </div>

                  {/* Preferred Position */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Preferred Position</label>
                    <select
                      name="preferredPosition"
                      value={form.preferredPosition}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs cursor-pointer"
                    >
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-rounder">All-rounder</option>
                      <option value="Wicket Keeper">Wicket Keeper</option>
                      <option value="Captain">Captain</option>
                    </select>
                  </div>

                  {/* Skill Level */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Skill Level</label>
                    <select
                      name="skillLevel"
                      value={form.skillLevel}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>

                  {/* Batting Style */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Batting Style</label>
                    <select
                      name="battingStyle"
                      value={form.battingStyle}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs cursor-pointer"
                    >
                      <option value="Right Hand">Right Hand</option>
                      <option value="Left Hand">Left Hand</option>
                      <option value="None">None</option>
                    </select>
                  </div>

                  {/* Bowling Style */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Bowling Style</label>
                    <select
                      name="bowlingStyle"
                      value={form.bowlingStyle}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-slate-200 px-3.5 py-2.5 rounded-xl outline-none text-xs cursor-pointer"
                    >
                      <option value="Fast">Fast</option>
                      <option value="Medium">Medium</option>
                      <option value="Spin">Spin</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Settings'}
                </button>
              </form>
            </div>
          ) : (
            // Statistics Grid Card
            <div className="space-y-6">
              {/* Cricket stats */}
              <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
                <h3 className="font-outfit text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> Career Cricket Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {statCards.map((card, idx) => (
                    <div key={idx} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{card.label}</p>
                      <p className={`text-xl font-extrabold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Preferences details */}
              <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
                <h3 className="font-outfit text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" /> Style & Preferences
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-900/50 rounded-xl space-y-0.5">
                    <span className="text-slate-500 block">Batting Hand</span>
                    <span className="font-bold text-slate-200">{user?.battingStyle} Bat</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-xl space-y-0.5">
                    <span className="text-slate-500 block">Bowling Type</span>
                    <span className="font-bold text-slate-200">{user?.bowlingStyle} Delivery</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-xl space-y-0.5">
                    <span className="text-slate-500 block">Primary Position</span>
                    <span className="font-bold text-slate-200">{user?.preferredPosition}</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-xl space-y-0.5">
                    <span className="text-slate-500 block">Skill Bracket</span>
                    <span className="font-bold text-slate-200">{user?.skillLevel} Tier</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
