'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Api } from '../../../lib/api';
import { usePlayer } from '../../../context/PlayerContext';
import { useTheme } from '../../../context/ThemeContext';
import { Song, Language } from '@sur-o-jhankaar/shared-types';
import { RADIO_STATIONS, RadioStationConfig } from '@sur-o-jhankaar/player-core';
import { Radio as RadioIcon, Play, Pause, SkipForward, Volume2, Sparkles, SlidersHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import Image from 'next/image';

export default function RadioPage() {
  const { playSong, isPlaying, togglePlay } = usePlayer();
  const { setThemeById } = useTheme();
  const [activeStation, setActiveStation] = useState<RadioStationConfig>(RADIO_STATIONS[0]);
  const [currentRadioSong, setCurrentRadioSong] = useState<Song | null>(null);
  const [isTuning, setIsTuning] = useState(false);
  const [radioHistory, setRadioHistory] = useState<string[]>([]);
  const rulerRef = useRef<HTMLDivElement | null>(null);

  const tuneToNextTrack = async (station = activeStation) => {
    setIsTuning(true);
    try {
      setThemeById(station.themeId as any);
      const res = await Api.getNextRadioTrack({
        scope: { language: station.language },
        history: radioHistory,
        lastArtist: currentRadioSong?.displayArtist || currentRadioSong?.artists
      });

      if (res?.song) {
        setCurrentRadioSong(res.song);
        setRadioHistory(prev => [res.song!.id, ...prev.slice(0, 30)]);
        playSong(res.song, [res.song], 0, true);
      }
    } catch (err) {
      console.error('Radio tune error:', err);
    } finally {
      setTimeout(() => setIsTuning(false), 450);
    }
  };

  useEffect(() => {
    tuneToNextTrack(activeStation);
  }, [activeStation]);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetFreq = 88.0 + ratio * 20.0;

    // Find closest preset
    let closest = RADIO_STATIONS[0];
    let minDiff = 999;
    for (const s of RADIO_STATIONS) {
      const diff = Math.abs(s.frequency - targetFreq);
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    }
    setActiveStation(closest);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 select-none">
      {/* Radio Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <RadioIcon className="w-3.5 h-3.5" />
          <span>Classic Analog Radio Broadcast</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider">
          SUR O JHANKAAR RADIO
        </h1>
        <p className="text-xs md:text-sm text-zinc-400">
          Continuous broadcast with §9 weighted selection algorithm and cultural streak prevention
        </p>
      </div>

      {/* Vintage Radio Chassis UI */}
      <div className="glass-panel rounded-3xl p-6 md:p-10 border-2 border-amber-900/40 bg-gradient-to-b from-[#1E1612] to-[#0E0B09] shadow-2xl space-y-8 relative overflow-hidden">
        {/* Chassis Wood Grain Trim */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950 border-b border-amber-950" />

        {/* Top Frequency Dial Screen */}
        <div className="rounded-2xl bg-[#090807] border border-amber-800/40 p-6 shadow-inner relative overflow-hidden">
          {/* Dial Glow */}
          <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Big Frequency Readout */}
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                {activeStation.frequency.toFixed(1)}
              </span>
              <span className="text-xl font-bold font-mono text-amber-600">FM</span>
            </div>

            {/* Station Title & Status */}
            <div className="text-center md:text-right space-y-1">
              <div className="flex items-center justify-center md:justify-end space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs uppercase tracking-widest font-extrabold text-amber-300">
                  {isTuning ? 'TUNING AIRWAVE FREQUENCY...' : 'LIVE BROADCAST'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {activeStation.name}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-1">
                {activeStation.description}
              </p>
            </div>
          </div>

          {/* Analog Tuning Scale Ruler */}
          <div
            ref={rulerRef}
            onClick={handleRulerClick}
            className="mt-6 pt-4 border-t border-amber-900/40 relative cursor-pointer group"
            title="Click along the ruler to tune frequency"
          >
            <div className="flex justify-between text-[11px] font-mono text-amber-600 font-bold px-2">
              <span>88.0</span>
              <span className="text-amber-300">91.9 BANGLA</span>
              <span className="text-amber-300">92.7 HINDI</span>
              <span className="text-amber-300">98.7 AIRWAVE</span>
              <span className="text-amber-300">104.0 BHOJPURI</span>
              <span>108.0</span>
            </div>

            {/* Simulated Tuning Needle */}
            <div
              className="absolute top-1 bottom-0 w-1.5 bg-red-500 rounded-full shadow-[0_0_12px_#ef4444] transition-all duration-700"
              style={{
                left: `${((activeStation.frequency - 88) / 20) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Station Presets Push-Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {RADIO_STATIONS.map(station => {
            const isSelected = activeStation.language === station.language;
            return (
              <button
                key={station.name}
                onClick={() => setActiveStation(station)}
                className={clsx(
                  'p-3.5 rounded-2xl border text-left transition-all',
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-glow font-bold scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                )}
              >
                <div className="text-xs font-mono font-bold text-amber-500">{station.frequency} FM</div>
                <div className="text-xs font-bold truncate mt-1 text-white">{station.name}</div>
              </button>
            );
          })}
        </div>

        {/* Currently Playing on Air */}
        {currentRadioSong && (
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border border-amber-900/30">
            <div className="flex items-center space-x-4 min-w-0">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-amber-900/40">
                {currentRadioSong.artworkUrl ? (
                  <Image src={currentRadioSong.artworkUrl} alt={currentRadioSong.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">📻</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  On Air Now
                </div>
                <h4 className="font-bold text-sm text-white truncate">
                  {currentRadioSong.title}
                </h4>
                <p className="text-xs text-zinc-400 truncate">
                  {currentRadioSong.displayArtist || currentRadioSong.artists}
                </p>
              </div>
            </div>

            {/* Transport controls for Radio */}
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-glow hover:scale-105 transition-transform"
                title={isPlaying ? 'Pause broadcast' : 'Play broadcast'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
              </button>

              <button
                onClick={() => tuneToNextTrack()}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                title="Skip to next track on this frequency"
              >
                <SkipForward className="w-4 h-4" />
                <span>Next Track</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
