import Controller from './Controller';
import { Response, Request, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import queue from '../../utils/Queue';

class MainController extends Controller {
    async main(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            // @ts-ignore
            const outputDir = `${process.cwd()}/dist`;
            res.sendFile(path.join(outputDir, 'index.html'));
        } catch (e: any) {
            next(e);
        }
    }

    async stream(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { id, client } = queue.addClient();

            res.set({
                'Content-Type': 'audio/mp3',
                'Transfer-Encoding': 'chunked',
            }).status(200);

            client.pipe(res);

            req.on('close', () => {
                queue.removeClient(id);
            });
        } catch (e: any) {
            next(e);
        }
    }
}

export default new MainController();
