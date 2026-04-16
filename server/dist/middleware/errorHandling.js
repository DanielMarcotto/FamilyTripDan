"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatch = exports.errorHandler = void 0;
class ErrorResponse extends Error {
    constructor(message, statusCode) {
        // Ensure the message property is passed correctly to the Error class
        super(message);
        this.statusCode = statusCode;
        // This ensures the error's stack trace is correctly captured in the context of this class
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        // Ensure the name is set to the correct error class name
        this.name = this.constructor.name;
    }
}
//Parse tricky errors
const errorHandler = (err, _req, res, next) => {
    let error = Object.assign({}, err);
    error.message = err.message;
    //Log to console for dev
    console.log("ERROR: ", err);
    //Mongoose bad ObjectId
    if (err.name === "CastError") {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }
    //Mongoose validation error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((value) => value.message);
        error = new ErrorResponse("MongoDB Validation error, check if the types you are setting are correct, right now they do not match the schema", 400);
    }
    //Mongoose duplicate key
    if (err.code === 11000 || err.code === 11001) {
        let message = "";
        const match = error.message.match(/index: (\w+)_1 dup key: { (\w+): "(.+)" }/);
        if (match) {
            const keyName = match[2];
            const duplicateValue = match[3];
            const formattedKey = keyName
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            message = `${formattedKey} ${duplicateValue} already exists`;
        }
        else {
            message = "Name already exists";
        }
        error = new ErrorResponse(message, 409);
    }
    res
        .status(error.statusCode || 500)
        .json({ success: false, message: error.message || "Server Error" });
    next();
};
exports.errorHandler = errorHandler;
// Middleware to wrap async route handlers with try/catch
const tryCatch = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            console.error(`Unexpected Error - trycatch middlewrare - ${error.message}`);
            res.status(500).json({ success: false, error });
        });
    };
};
exports.tryCatch = tryCatch;
