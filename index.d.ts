export declare class Writer {
    private filename;
    private tempFilename;
    private locked;
    private prev;
    private next;
    private nextPromise;
    private nextData;
    constructor(filename: string);
    private _add;
    private _write;
    write(data: string): Promise<void>;
}
