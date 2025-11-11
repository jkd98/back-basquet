import { ServerResponse } from '../models/ServerResponse.js';


let response = new ServerResponse();
export const createResponse = (status, msg, data = null) => {
    response.status = status;
    response.msg = msg;
    response.data = data;
    return response;
}