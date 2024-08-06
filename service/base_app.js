const sendResponse = (res, httpcode, code, message, data = null) => {
    try {
        res.status(httpcode).json({ code, message, data });
    } catch (error) {
        console.error("sendResponse Error", error);
    }
};

const sendSuccessResponse = (res) => {
    try {
        sendResponse(res,200,200,"SUCCESS",true);
    } catch (error) {
        console.error("sendResponse Error", error);
    }
};

const sendSuccessData = (res,data) => {
    try {
        sendResponse(res,200,200,"SUCCESS",data);
    } catch (error) {
        console.error("sendResponse Error", error);
    }
};

const sendError = (res) => {
    try {
        sendResponse(res,200,500,"ERR0R",false);
    } catch (error) {
        console.error("sendResponse Error", error);
    }
};

// 登录状态检查中间件
const isAuthenticated = (req, res, next) => {
    if (req.session &&  req.session.wallet && req.session.wallet.addr) {
        next(); // 用户已登录，继续下一个中间件或路由处理
    } else {
        sendResponse(res, 401, 'Unauthorized: No session available.');
    }
};


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export {isAuthenticated,delay,sendResponse,sendSuccessResponse,sendSuccessData,sendError}