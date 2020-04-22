declare module 'streamifier' {
  import { ReadStream } from 'fs';

  function createReadStream(file: Buffer): ReadStream;
}
