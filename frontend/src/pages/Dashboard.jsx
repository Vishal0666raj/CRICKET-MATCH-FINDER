import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';
import MapView from '../components/MapView';
import { Compass, Calendar, Clock, Trophy, MapPin, Search, SlidersHorizontal, Map, UserCheck, Play, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, updateLookingForMatch } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [ballType, setBallType] = useState('All');
  const [skillLevel, setSkillLevel] = useState('All');
  const [distance, setDistance] = useState(15);
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Get user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoaded(true);
        },
        (error) => {
          console.log('Location access declined or failed, using defaults.', error.message);
          setLocationLoaded(true); // set loaded to true even on failure to trigger queries
        }
      );
    } else {
      setLocationLoaded(true);
    }
  }, []);

  // Fetch Matches using React Query
  const { data: matches = [], isLoading, refetch } = useQuery({
    queryKey: ['matches', searchTerm, ballType, skillLevel, distance, coords, locationLoaded],
    queryFn: async () => {
      if (!locationLoaded) return [];
      const params = {
        query: searchTerm,
        ballType,
        skill: skillLevel,
        longitude: coords.lng,
        latitude: coords.lat,
        distance
      };
      const res = await axiosInstance.get('/matches', { params });
      return res.data;
    },
    enabled: locationLoaded
  });

  // Toggle Looking for Match
  const [lookingState, setLookingState] = useState(user?.isLookingForMatch || false);
  const [lookingRadius, setLookingRadius] = useState(user?.lookingForMatchConfig?.preferredRadius || 10);

  const toggleLookingMutation = useMutation({
    mutationFn: async () => {
      return await updateLookingForMatch({
        isLookingForMatch: !lookingState,
        longitude: coords.lng,
        latitude: coords.lat,
        preferredRadius: lookingRadius
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        setLookingState(data.user.isLookingForMatch);
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    }
  });

  const handleToggleLooking = () => {
    toggleLookingMutation.mutate();
  };

  // Convert matches into Leaflet map marker positions
  const mapMarkers = matches.map((m) => {
    const coords = m.location?.coordinates || [0, 0];
    return {
      position: [coords[1], coords[0]], // [latitude, longitude]
      popup: (
        <div className="p-1 font-sans text-xs">
          <p className="font-bold text-slate-100 text-sm mb-1">{m.title}</p>
          <p className="text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {m.ground}
          </p>
          <p className="text-slate-400 mb-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" /> {new Date(m.date).toLocaleDateString()}
          </p>
          <button
            onClick={() => navigate(`/matches/${m._id}`)}
            className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold py-1 px-2.5 rounded text-[10px] text-slate-950 flex items-center justify-center gap-1 cursor-pointer"
          >
            View Match <Play className="w-2.5 h-2.5 fill-slate-950" />
          </button>
        </div>
      )
    };
  });

  return (
    <div className="space-y-6">
      {/* Looking For Match Control Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1">
          <h2 className="font-outfit text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserCheck className="w-5.5 h-5.5 text-emerald-400" /> &quot;Looking for Match&quot; Mode
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            Enable this mode to broadcast your availability and position skill level to organizers nearby. They can invite you to their scheduled matches directly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {lookingState && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300">
              <span>Radius:</span>
              <input
                type="range"
                min="2"
                max="50"
                value={lookingRadius}
                onChange={(e) => setLookingRadius(e.target.value)}
                className="w-24 accent-emerald-400"
              />
              <span className="font-mono text-emerald-400 font-semibold">{lookingRadius}km</span>
            </div>
          )}

          <button
            onClick={handleToggleLooking}
            disabled={toggleLookingMutation.isPending}
            className={`py-3 px-6 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
              lookingState
                ? 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/10'
            }`}
          >
            {toggleLookingMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : lookingState ? (
              'Stop Looking'
            ) : (
              "I'm Looking For Match"
            )}
          </button>
        </div>
      </div>

      {/* Filter and Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Search & Matches List */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-auto md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search ground, team or creator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 pl-10 pr-4 py-2.5 rounded-lg outline-none text-xs text-slate-200 placeholder-slate-600 transition-colors"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={ballType}
                  onChange={(e) => setBallType(e.target.value)}
                  className="bg-transparent text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-950">All Balls</option>
                  <option value="Tennis" className="bg-slate-950">Tennis</option>
                  <option value="Leather" className="bg-slate-950">Leather</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
                <Trophy className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="bg-transparent text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All" className="bg-slate-950">All Skills</option>
                  <option value="Beginner" className="bg-slate-950">Beginner</option>
                  <option value="Intermediate" className="bg-slate-950">Intermediate</option>
                  <option value="Advanced" className="bg-slate-950">Advanced</option>
                  <option value="Professional" className="bg-slate-950">Professional</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
                <span className="text-slate-500">Radius:</span>
                <select
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="bg-transparent text-slate-300 outline-none cursor-pointer font-semibold font-mono"
                >
                  <option value="5" className="bg-slate-950">5 km</option>
                  <option value="10" className="bg-slate-950">10 km</option>
                  <option value="15" className="bg-slate-950">15 km</option>
                  <option value="25" className="bg-slate-950">25 km</option>
                  <option value="50" className="bg-slate-950">50 km</option>
                </select>
              </div>
            </div>
          </div>

          {/* Match Cards List */}
          <div className="flex-1 space-y-4">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl animate-pulse h-40" />
              ))
            ) : matches.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
                <Info className="w-8 h-8 text-slate-600" />
                <p className="text-slate-400 text-sm font-semibold">No matches found nearby</p>
                <p className="text-slate-500 text-xs max-w-sm">
                  Try expanding your search distance radius, modifying filter selections, or check back later.
                </p>
              </div>
            ) : (
              matches.map((match) => (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(`/matches/${match._id}`)}
                  className="p-5 bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        match.ballType === 'Leather'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {match.ballType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 border border-slate-700 text-slate-400">
                        {match.skillLevel}
                      </span>
                    </div>

                    <h3 className="font-outfit text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {match.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {match.ground}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" /> {new Date(match.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {match.time}
                      </span>
                    </div>
                  </div>

                  {/* Join state and entry fee details */}
                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Entry Fee</p>
                      <p className="text-sm font-extrabold text-white">
                        {match.entryFee === 0 ? 'Free' : `₹${match.entryFee}`}
                      </p>
                    </div>

                    <div className="mt-2 text-right">
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">
                        {match.acceptedPlayersCount} / {match.maxPlayers} Players
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 group-hover:underline">
                        {match.hasJoined ? 'View Details' : 'Join Game →'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Geospatial Map View */}
        <div className="lg:col-span-1 h-[300px] lg:h-auto lg:min-h-[500px] sticky top-24">
          <div className="w-full h-full flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 p-3.5 gap-3.5">
            <div className="flex items-center gap-2 px-1">
              <Map className="w-4.5 h-4.5 text-emerald-400" />
              <span className="font-outfit font-bold text-sm text-slate-200">Active Grounds Nearby</span>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden relative">
              {locationLoaded ? (
                <MapView center={[coords.lat, coords.lng]} markers={mapMarkers} />
              ) : (
                <div className="w-full h-full bg-slate-950 flex items-center justify-center border border-slate-800 rounded-xl">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                    <p className="text-xs text-slate-500">Pinpointing grounds on map...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
