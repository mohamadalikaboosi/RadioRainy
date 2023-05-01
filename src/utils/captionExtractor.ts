export default function extractData(text) {
    const artist = text.match(/^(.*?)[-–]/)[1].trim();
    const music = text.match(/[-–](.*?)\n/)[1].trim();
    const hashtags = text.match(/#(\w+)/g).map((tag) => tag.replace('#', ''));

    return {
        artist,
        music,
        hashtags,
    };
}
