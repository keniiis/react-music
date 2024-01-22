import React, { useRef, useState, useEffect } from "react";
import AudioSpectrum from "react-audio-spectrum";
import './audioPlayer.css';

const AudioPlayer = ({ audioSrc }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [lyrics, setLyrics] = useState<{ time: number; text: string; }[]>([]);
    const [currentLyric, setCurrentLyric] = useState('');

    const audioRef = useRef<HTMLAudioElement | null>(null);

    async function getLyrics() {
        const response = await fetch('./assets/soledad.lrc');
        const lyricsText = await response.text();
        const processedLyrics = processLyrics(lyricsText);
        setLyrics(processedLyrics);
    }

    function processLyrics(lyricsText) {
        const lines = lyricsText.split('\n');
        const lyrics: { time: number; text: string; }[] = [];
    
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/(\[\d+:\d+\.\d+\])(.*)/);
    
            if (match) {
                const timeParts = match[1].slice(1, -1).split(':');
                const minutes = parseInt(timeParts[0]);
                const seconds = parseFloat(timeParts[1]);
                const time = minutes * 60 + seconds;
                const text = match[2];
                lyrics.push({ time, text });
            }
        }
    
        return lyrics;
    }
    

    const handleSeek = (e) => {
        if (audioRef.current) {
            audioRef.current.currentTime = e.target.value;
            setCurrentTime(e.target.value);
        }
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
    
            // Redondea el tiempo de reproducción actual al número decimal más cercano.
            const currentTime = Math.round(audioRef.current.currentTime * 10) / 10;
    
            console.log(`Current time: ${currentTime}`);
    
            let currentLine;
    
            // Comprueba si el array de letras no está vacío antes de buscar la letra correspondiente.
            if (lyrics.length > 0) {
                console.log(`Lyrics: ${JSON.stringify(lyrics)}`);
    
                // Busca la primera letra cuyo tiempo sea mayor o igual al tiempo de reproducción actual.
                const currentIndex = lyrics.findIndex((line) => currentTime <= line.time);
    
                // Si no se encontró ninguna letra, usa la última letra.
                // Si se encontró al menos una letra, usa la letra anterior.
                // Si se encontró la primera letra, usa la primera letra.
                currentLine = currentIndex === -1 || currentIndex === 0 ? lyrics[lyrics.length - 1] : lyrics[currentIndex - 1];
    
                console.log(`Found lyric: ${JSON.stringify(currentLine)}`);
            }
    
            if (currentLine && currentLine.time) {
                const trimmedText = currentLine.text.trim();
                if (trimmedText !== '') {
                    setCurrentLyric(trimmedText);
                    console.log(`Trimmed text: ${trimmedText}`);
                }
            }
        }
    }    

    const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }

    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }

    const handlePlayPause = () => {
        if (isPlaying) {
            handlePause();
        } else {
            handlePlay();
        }
    }

    const handleEnded = () => {
        setCurrentTime(0);
        setIsPlaying(false);
    }

    function formatDuration(durationSeconds) {
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = Math.floor(durationSeconds % 60);

        const formattedSeconds = seconds.toString().padStart(2, "0");
        return `${minutes}:${formattedSeconds}`;
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
            audioRef.current.addEventListener("ended", handleEnded);
    
            return () => {
                if (audioRef.current) {
                    audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
                    audioRef.current.removeEventListener("ended", handleEnded);
                }
            };
        }
    }, [audioRef]);

    useEffect(() => {
        getLyrics();
    }, []);    

    return (
        <div className="player-card">
            <img src="./assets/portada.jpg" alt="Cover Image" />

            <AudioSpectrum
                id="audio-canvas"
                height={100}
                width={300}
                audioId="audio-element"
                capColor={'#000'}
                capHeight={2}
                meterWidth={2}
                meterCount={512}
                meterColor={[
                    {stop: 0, color: '#000'},
                    {stop: 0.5, color: '#000'},
                    {stop: 1, color: '#000'}
                ]}
                gap={4}
            />

            <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
            />

            <audio ref={audioRef} src={audioSrc} id="audio-element" />

            <div className="track-duration">
                <p>{formatDuration(currentTime)}</p>
                <p>{formatDuration(duration)}</p>
            </div>

            <button className="pause-play" onClick={handlePlayPause}>
                <span className="material-symbols-rounded">
                    {isPlaying ? "pause" : "play_arrow"}
                </span>
            </button>

            <p style={{backgroundColor: 'transparent', border: 'none'}}>{currentLyric}</p>

        </div>
    )
}

export default AudioPlayer;
