/**
 * Node.js global type stubs
 * These will be superseded by @types/node once npm install is run.
 */

declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  argv: string[];
  pid: number;
  version: string;
  platform: string;
  memoryUsage(): {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  cpuUsage(previousValue?: { user: number; system: number }): { user: number; system: number };
  on(event: string, listener: (...args: unknown[]) => void): typeof process;
  once(event: string, listener: (...args: unknown[]) => void): typeof process;
  removeListener(event: string, listener: (...args: unknown[]) => void): typeof process;
  hrtime(time?: [number, number]): [number, number];
  uptime(): number;
  nextTick(callback: (...args: unknown[]) => void, ...args: unknown[]): void;
  stdout: { write(chunk: string): boolean };
  stderr: { write(chunk: string): boolean };
};

declare const __dirname: string;
declare const __filename: string;

declare function require(id: string): any;
declare function setTimeout(handler: (...args: unknown[]) => void, timeout?: number, ...args: unknown[]): ReturnType<typeof setTimeout>;
declare function clearTimeout(handle?: ReturnType<typeof setTimeout>): void;
declare function setInterval(handler: (...args: unknown[]) => void, timeout?: number, ...args: unknown[]): ReturnType<typeof setInterval>;
declare function clearInterval(handle?: ReturnType<typeof setInterval>): void;
declare function setImmediate(handler: (...args: unknown[]) => void, ...args: unknown[]): ReturnType<typeof setImmediate>;
declare function clearImmediate(handle?: ReturnType<typeof setImmediate>): void;

declare class Buffer extends Uint8Array {
  static from(value: string | ArrayBuffer | SharedArrayBuffer | Uint8Array | ReadonlyArray<number> | Buffer, encodingOrOffset?: string | number, length?: number): Buffer;
  static alloc(size: number, fill?: string | number | Buffer, encoding?: BufferEncoding): Buffer;
  static allocUnsafe(size: number): Buffer;
  static concat(list: ReadonlyArray<Uint8Array>, totalLength?: number): Buffer;
  static isBuffer(obj: any): obj is Buffer;
  static byteLength(string: string | Buffer | ArrayBuffer | SharedArrayBuffer | ArrayBufferView, encoding?: BufferEncoding): number;
  toString(encoding?: BufferEncoding, start?: number, end?: number): string;
  toJSON(): { type: 'Buffer'; data: number[] };
  copy(target: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  compare(target: Buffer, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number;
  equals(otherBuffer: Uint8Array): boolean;
  fill(value: string | number | Buffer | Uint8Array, offset?: number, end?: number, encoding?: BufferEncoding): this;
  indexOf(value: string | number | Buffer | Uint8Array, byteOffset?: number, encoding?: BufferEncoding): number;
  lastIndexOf(value: string | number | Buffer | Uint8Array, byteOffset?: number, encoding?: BufferEncoding): number;
  includes(value: string | number | Buffer, byteOffset?: number, encoding?: BufferEncoding): boolean;
  slice(start?: number, end?: number): Buffer;
  subarray(start?: number, end?: number): Buffer;
  readUInt8(offset?: number): number;
  readUInt16BE(offset?: number): number;
  readUInt16LE(offset?: number): number;
  readUInt32BE(offset?: number): number;
  readUInt32LE(offset?: number): number;
  readInt8(offset?: number): number;
  readInt16BE(offset?: number): number;
  readInt16LE(offset?: number): number;
  readInt32BE(offset?: number): number;
  readInt32LE(offset?: number): number;
  writeUInt8(value: number, offset?: number): number;
  writeUInt16BE(value: number, offset?: number): number;
  writeUInt16LE(value: number, offset?: number): number;
  writeUInt32BE(value: number, offset?: number): number;
  writeUInt32LE(value: number, offset?: number): number;
  writeInt8(value: number, offset?: number): number;
  writeInt16BE(value: number, offset?: number): number;
  writeInt16LE(value: number, offset?: number): number;
  writeInt32BE(value: number, offset?: number): number;
  writeInt32LE(value: number, offset?: number): number;
}

type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';

declare namespace NodeJS {
  type Timeout = ReturnType<typeof setTimeout>;
  type Immediate = ReturnType<typeof setImmediate>;
  interface ProcessEnv extends Record<string, string | undefined> {}
  interface ReadableStream {
    pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean }): T;
  }
  interface WritableStream {
    write(buffer: string | Buffer, cb?: (err?: Error | null) => void): boolean;
    end(cb?: () => void): void;
  }
  interface EventEmitter {
    on(event: string | symbol, listener: (...args: unknown[]) => void): this;
    off(event: string | symbol, listener: (...args: unknown[]) => void): this;
    once(event: string | symbol, listener: (...args: unknown[]) => void): this;
    emit(event: string | symbol, ...args: unknown[]): boolean;
    removeListener(event: string | symbol, listener: (...args: unknown[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    listeners(event: string | symbol): Function[];
    listenerCount(event: string | symbol): number;
    getMaxListeners(): number;
    setMaxListeners(n: number): this;
    rawListeners(event: string | symbol): Function[];
    eventNames(): Array<string | symbol>;
    prependListener(event: string | symbol, listener: (...args: unknown[]) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: unknown[]) => void): this;
    addListener(event: string | symbol, listener: (...args: unknown[]) => void): this;
  }
  type Signals = 'SIGABRT' | 'SIGALRM' | 'SIGBUS' | 'SIGCHLD' | 'SIGCONT' | 'SIGFPE' | 'SIGHUP' | 'SIGILL' | 'SIGINT' | 'SIGIO' | 'SIGIOT' | 'SIGKILL' | 'SIGPIPE' | 'SIGSEGV' | 'SIGTERM' | 'SIGUSR1' | 'SIGUSR2';
}

declare namespace Express {
  interface Request {
    user?: any;
    file?: any;
    files?: any;
    rawBody?: Buffer;
    idempotencyKey?: string;
  }
  interface Response {
    json(body?: any): this;
    status(code: number): this;
    set(field: string | Record<string, string>, val?: string): this;
    send(body?: any): this;
  }
  interface Multer {
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: Array<{ name: string; maxCount?: number }>): any;
    none(): any;
  }
}

declare namespace Reflect {
  function defineMetadata(metadataKey: any, metadataValue: any, target: object, propertyKey?: string | symbol): void;
  function getMetadata(metadataKey: any, target: object, propertyKey?: string | symbol): any;
  function hasMetadata(metadataKey: any, target: object, propertyKey?: string | symbol): boolean;
  function hasOwnMetadata(metadataKey: any, target: object, propertyKey?: string | symbol): boolean;
  function getOwnMetadata(metadataKey: any, target: object, propertyKey?: string | symbol): any;
  function deleteMetadata(metadataKey: any, target: object, propertyKey?: string | symbol): boolean;
  function getMetadataKeys(target: object, propertyKey?: string | symbol): unknown[];
  function getOwnMetadataKeys(target: object, propertyKey?: string | symbol): unknown[];
  function decorate(decorators: ClassDecorator[], target: Function): Function;
  function decorate(decorators: Array<MethodDecorator | ParameterDecorator>, target: object, propertyKey: string | symbol, attributes?: PropertyDescriptor): PropertyDescriptor;
  function metadata(metadataKey: any, metadataValue: any): { (target: Function): void; (target: object, propertyKey: string | symbol): void };
}
