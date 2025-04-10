'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface TrackWaveformProps {
  url: string;
  isPlaying: boolean;
  onPlayPause: (isPlaying: boolean) => void;
}

export function TrackWaveform({ url, isPlaying, onPlayPause }: TrackWaveformProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#94a3b8',
        progressColor: '#3b82f6',
        cursorColor: '#3b82f6',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 40,
        barGap: 3,
      });

      wavesurfer.current.load(url);

      wavesurfer.current.on('ready', () => {
        setIsReady(true);
      });

      wavesurfer.current.on('finish', () => {
        onPlayPause(false);
      });

      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, [url]);

  useEffect(() => {
    if (wavesurfer.current && isReady) {
      if (isPlaying) {
        wavesurfer.current.play();
      } else {
        wavesurfer.current.pause();
      }
    }
  }, [isPlaying, isReady]);

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full shrink-0"
        onClick={() => onPlayPause(!isPlaying)}
        disabled={!isReady}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      <div ref={waveformRef} className="flex-1 min-w-0" />
    </div>
  );
}
