import { useEffect, useCallback } from 'react';
import axios from 'axios';

const useAudioStreamer = (socket) => {
    const handleMusicInfo = useCallback((musicInfo) => {
        console.log('=>(useAudioStreamer.js:17) musicInfo', musicInfo);

        if (!musicInfo) {
            // If musicInfo is not available, fetch it from the server
            getCurrentTrackInfo();
        }
    }, []);

    useEffect(() => {
        socket.on('currentMusicInfo', handleMusicInfo);

        return () => {
            socket.off('currentMusicInfo', handleMusicInfo);
        };
    }, [socket, handleMusicInfo]);

    const getCurrentTrackInfo = async () => {
        try {
            const response = await axios.get('/getCurrentTrackInfo');
            const musicInfo = response.data;
            console.log('Fetched current track info:', musicInfo);

            // Handle the fetched musicInfo as needed
            // ...
        } catch (error) {
            console.error('Error fetching current track info:', error);
        }
    };
};

export default useAudioStreamer;