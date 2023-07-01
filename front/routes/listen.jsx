import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAudioStreamer from '../hooks/useAudioStreamer';
import { Headphones } from 'react-feather';

const URL = 'http://192.168.43.153:3001';

function Listen() {
    const socketRef = useRef(io(URL));
    const [musicInfo, setMusicInfo] = useState(null);
    useAudioStreamer(socketRef.current);

    useEffect(() => {
        socketRef.current.on('currentMusicInfo', (musicInfo) => {
            setMusicInfo(musicInfo);
        });
        return () => {
            socketRef.current.off('currentMusicInfo');
        };
    }, []);

    return (
        <div className="flex flex-col items-center h-full">
            <h1 className="text-5xl font-bold">Listening...</h1>
            {musicInfo && (
                <div className="text-center mt-5">
                    <h2 className="text-3xl font-bold">{musicInfo.musicName}</h2>
                    <h3 className="text-xl">{musicInfo.artist}</h3>
                    <ul>
                        {musicInfo.hashtags.map((hashtag, index) => (
                            <li key={index}>#{hashtag}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="rounded-full bg-gray-700 p-6 mt-5">
                <Headphones size={50} />
            </div>
            <audio id="audioElement" src={`${URL}/stream`} autoPlay />
        </div>
    );
}

export default Listen;
