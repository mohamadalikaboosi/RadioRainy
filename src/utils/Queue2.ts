// // import fs from 'fs';
// // import _ from 'underscore';
//
// class Queue {
//     tracks: string[] = [];
//     playingTrack: string = '';
//     isPLaying: boolean = false;
//     currentTime: number = 0;
//
//     loadTracks() {
//         this.setTracks(fs.readdirSync(this.directory));
//     }
//
//     getTracks() {
//         return this.tracks;
//     }
//
//     setTracks(tracks) {
//         this.tracks = tracks;
//     }
//
//     addTrack(musicName) {
//         if (!this.getTracks().includes(musicName)) {
//             this.getTracks().push(musicName);
//             const sortedArr = _.sortBy(this.getTracks());
//             this.setTracks(sortedArr);
//         }
//     }
//
//     tracksCount() {
//         return this.getTracks().length;
//     }
//
//     getDirectory() {
//         return this.directory;
//     }
//
//     nextSong(musicName) {
//         const musicNameIndex = this.getTracks().indexOf(musicName);
//         if (musicNameIndex < this.tracksCount() - 1) {
//             const nextTrackIndex = musicNameIndex + 1;
//             return this.tracks[nextTrackIndex];
//         }
//         const nextTrackIndex = 0;
//         return this.tracks[nextTrackIndex];
//     }
//
//     setPlayingTrack(value: string): void {
//         this.playingTrack = value;
//     }
//
//     getPlayingTrack(): string {
//         return this.playingTrack;
//     }
//
//     setIsPLaying(value: boolean): void {
//         this.isPLaying = value;
//     }
//
//     getIsPLaying(): boolean {
//         return this.isPLaying;
//     }
//
//     setCurrentTime(value: number): void {
//         this.currentTime = value;
//     }
//
//     getCurrentTime(): number {
//         return this.currentTime;
//     }
// }
//
// export default new Queue();
