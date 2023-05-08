import { useEffect, useRef } from 'react';

const useAudioStreamer = (socket) => {
    useEffect(() => {
        socket.on('currentMusicInfo', (musicInfo) => {
            console.log('=>(useAudioStreamer.js:17) musicInfo', musicInfo);
        });
    });
};

export default useAudioStreamer;
