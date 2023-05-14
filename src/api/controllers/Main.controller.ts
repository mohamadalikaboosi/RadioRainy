import Controller from './Controller';
import { Response, Request, NextFunction } from 'express';
import path from 'path';
import queue from '../../utils/Queue';
import ip from 'ip';

class MainController extends Controller {
    async main(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
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

    async getIp(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const serverIp = ip.address();
            res.json({ serverIp });
        } catch (e: any) {
            next(e);
        }
    }
}

export default new MainController();
