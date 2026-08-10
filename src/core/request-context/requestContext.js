import { AsyncLocalStorage } from "node:async_hooks";

const requestContext = new AsyncLocalStorage();

export const getRequestId = () => {
    return requestContext.getStore()?.requestId;
};

export default requestContext;