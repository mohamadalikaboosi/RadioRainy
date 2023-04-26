import Controller from './Controller';
import { Response, Request, NextFunction } from 'express';

class MainController extends Controller {
    async main(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            return res.json('ok');
        } catch (e: any) {
            next(e);
        }
    }
}

export default new MainController();
