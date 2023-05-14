import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

export async function ffmegCompress(buffer: Buffer | string, filePathOrg: string, filePath: string): Promise<void> {
    fs.writeFileSync(filePathOrg, buffer);
    // Convert the music to low quality
    await new Promise((resolve, reject) => {
        ffmpeg(filePathOrg)
            .audioBitrate('64k') // Set the desired low bitrate
            .output(filePath)
            .on('end', resolve)
            .on('error', reject)
            .run();
    });
}
