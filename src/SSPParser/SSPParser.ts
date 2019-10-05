import { Transform, TransformCallback } from "stream";

const STX = 0x7f;
const emptyBuffer = Buffer.alloc(0);

/**
 * A transform stream that parses SSP event messages.
 * Each message starts with STX (0x7F)
 * And the third byte is the length of the message (without 3 bytes: STX, CRC, SEQ)
 *
 * @extends Transform
 */
class SSPParser extends Transform {
  private data: Buffer;

  constructor() {
    super();
    this.data = emptyBuffer;
  }

  // tslint:disable-next-line: function-name
  public _flush(cb: TransformCallback) {
    this.push(this.data);
    this.resetData();
    cb();
  }

  // tslint:disable-next-line: function-name
  public _transform(chunk: Buffer, encoding: string, cb: TransformCallback) {
    this.data = Buffer.from([...this.data, ...chunk]);
    const firstByteIndex = this.data.indexOf(STX);
    if (firstByteIndex === -1) {
      this.resetData();
      cb();
      return;
    }
    const lengthByteIndex = firstByteIndex + 2;
    const lengthByte = this.data[lengthByteIndex];

    if (lengthByte === undefined) {
      cb();
      return;
    }
    const length = lengthByte + 5; // + STX, CRC (x2), SEQ, LEN
    if (this.data.length < length) {
      cb();
      return;
    }
    this.push(this.data.slice(firstByteIndex, length));
    this.data = this.data.slice(firstByteIndex + length);
    if (this.data.length > 0) {
      this._transform(emptyBuffer, "utf8", cb);
      return;
    }
    cb();
  }

  private resetData() {
    this.data = emptyBuffer;
  }
}

export default SSPParser;
