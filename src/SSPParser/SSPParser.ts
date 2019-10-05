import { Transform, TransformCallback } from "stream";

const STX = 0x7f;

/**
 * A transform stream that parses SSP event messages.
 * Each message starts with STX (0x7F)
 * And the third byte is the length of the message (without 3 bytes: STX, CRCL, CRCH)
 *
 * @extends Transform
 */
class SSPParser extends Transform {
  private data: Buffer;

  constructor() {
    super();
    this.data = Buffer.alloc(0);
  }

  // tslint:disable-next-line: function-name
  public _flush(cb: TransformCallback) {
    this.push(this.data);
    this.data = Buffer.alloc(0);
    cb();
  }

  // tslint:disable-next-line: function-name
  public _transform(chunk: Buffer, encoding: string, cb: TransformCallback) {
    this.data = chunk;
    const firstByteIndex = this.data.indexOf(STX);
    if (firstByteIndex === -1) {
      return;
    }
    const lengthByteIndex = firstByteIndex + 2;
    const lengthByte = this.data[lengthByteIndex];
    const length = lengthByte + 3; // + STX, CRCL, CRCH

    if (chunk.length < length) {
      return;
    }
    this.push(this.data.slice(firstByteIndex, length));
    cb();
  }
}

export default SSPParser;
