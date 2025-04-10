'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  title: string;
}

export function AudioPlayer({ url, title }: AudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
        height: 50,
        barGap: 3,
      });

      wavesurfer.current.load(url);

      wavesurfer.current.on('finish', () => {
        setIsPlaying(false);
      });

      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, [url]);

  const togglePlayPause = () => {
    if (wavesurfer.current) {
      if (isPlaying) {
        wavesurfer.current.pause();
      } else {
        wavesurfer.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={togglePlayPause}
          title={isPlaying ? 'Pause' : 'Lecture'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div ref={waveformRef} className="w-full" />
    </div>
  );
}
