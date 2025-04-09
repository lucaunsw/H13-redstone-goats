"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Err = exports.ErrKind = exports.status = void 0;
var status;
(function (status) {
    status["PENDING"] = "pending";
    status["CONFIRMED"] = "confirmed";
    status["CANCELLED"] = "cancelled";
})(status || (exports.status = status = {}));
// Special error handling / other types
var ErrKind;
(function (ErrKind) {
    ErrKind[ErrKind["EINVALID"] = 400] = "EINVALID";
    ErrKind[ErrKind["EACCESS"] = 403] = "EACCESS";
    ErrKind[ErrKind["ENOTOKEN"] = 401] = "ENOTOKEN";
})(ErrKind || (exports.ErrKind = ErrKind = {}));
class Err extends Error {
    constructor(message, kind) {
        super(message);
        this.kind = kind;
        Error.captureStackTrace(this);
    }
}
exports.Err = Err;
