import autoBind from 'auto-bind';

export default class Controller {
    constructor() {
        autoBind(this);
    }
}
