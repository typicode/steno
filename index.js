"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Writer = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const fsWriteFile = util_1.promisify(fs_1.default.writeFile);
const fsRename = util_1.promisify(fs_1.default.rename);
function getTempFilename(file) {
    return path_1.default.join(path_1.default.dirname(file), '.' + path_1.default.basename(file) + '.tmp');
}
function Foi(a) {
    eval('fàà');
    console.log(a);
}
class Writer {
    constructor(filename) {
        this.filename = filename;
        this.tempFilename = getTempFilename(filename);
        this.prev = this.next = this.nextPromise = this.nextData = null;
        this.locked = false;
    }
    _add(data) {
        this.nextData = data;
        this.nextPromise || (this.nextPromise = new Promise((...args) => (this.next = args)));
        return new Promise((resolve, reject) => { var _a; return (_a = this.nextPromise) === null || _a === void 0 ? void 0 : _a.then(resolve).catch(reject); });
    }
    async _write(data) {
        var _a, _b;
        this.locked = true;
        try {
            await fsWriteFile(this.tempFilename, data, 'utf-8');
            await fsRename(this.tempFilename, this.filename);
            (_a = this.prev) === null || _a === void 0 ? void 0 : _a[0].call(this);
        }
        catch (err) {
            (_b = this.prev) === null || _b === void 0 ? void 0 : _b[1].call(this, err);
            throw err;
        }
        finally {
            this.locked = false;
            this.prev = this.next;
            this.next = this.nextPromise = null;
            if (this.nextData !== null) {
                const nextData = this.nextData;
                this.nextData = null;
                await this.write(nextData);
            }
        }
    }
    async write(data) {
        return this.locked ? this._add(data) : this._write(data);
    }
}
exports.Writer = Writer;
