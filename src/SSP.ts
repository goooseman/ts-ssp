import { EventEmitter } from "events";
import Serialport from "serialport";
import SSPCommands from "./SSPCommands";
import { getEventFromBuffer } from "./SSPEvents";
import { SSPOptions, SSPType } from "./types";
import { sleep } from "./utils";

class SSP<Type extends SSPType = "nv10usb"> extends EventEmitter {
  public commands?: SSPCommands<Type>;
  private options: Required<SSPOptions>;
  private socket?: Serialport;
  private pollTimeout?: NodeJS.Timeout;
  private type: Type;
  constructor(type: Type, options: SSPOptions) {
    super();
    this.type = type;
    this.options = {
      baudRate: 9600,
      dataBits: 8,
      stopbits: 2,
      parity: "none",
      sspID: 0,
      sequence: 0x80,
      ...options,
    };
  }

  public isOpened(): boolean {
    return (this.socket && this.socket.isOpen) || false;
  }

  public isEnabled(): boolean {
    return Boolean(this.pollTimeout) || false;
  }

  public async enable() {
    if (!this.commands) {
      throw new Error("Commands are not initialised");
    }
    const poll = () => {
      this.pollTimeout = setTimeout(() => {
        if (!this.commands) {
          throw new Error("Commands are not initialised");
        }
        void this.commands.exec("poll");
        poll();
      }, 400);
    };
    await this.commands.exec("enable");
    poll();
  }

  public async disable() {
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
    }
    if (!this.commands) {
      throw new Error("Commands are not initialised");
    }
    await this.commands.exec("disable");
  }

  public async reset() {
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
    }
    if (!this.commands) {
      throw new Error("Commands are not initialised");
    }
    await this.commands.exec("reset");
    if (!this.socket) {
      return;
    }
    this.socket.close();
  }

  public async open() {
    if (this.socket) {
      throw new Error("Connection is already opened");
    }
    this.socket = new Serialport(this.options.device, {
      baudRate: this.options.baudRate,
      dataBits: this.options.dataBits,
      stopBits: this.options.stopbits,
      parity: this.options.parity,
      autoOpen: false,
    });
    this.commands = new SSPCommands(
      this.socket,
      this.type,
      this.options.sspID,
      this.options.sequence,
    );
    this.socket.on("close", () => {
      this.emit("close");
    });
    this.socket.on("error", (err: Error) => {
      this.emit("error", err);
    });
    this.socket.on("data", this.handleData);
    this.socket.open();
    const low = this.options.currencies.reduce((p, c, i) => {
      return c === 1 ? p + Math.pow(2, i) : p;
    }, 0);
    //wait a bit for port buffer to empty
    await sleep(100);
    if (!this.commands) {
      throw new Error("Commands are not created");
    }
    await this.commands.exec("sync");
    await this.commands.exec("enable_higher_protocol");
    await this.commands.exec("set_channel_inhibits", low, 0x00);
    this.emit("start");
  }

  public async close() {
    if (!this.socket) {
      throw new Error("Connection is not opened");
    }
    if (this.isEnabled()) {
      await this.disable();
    }
    this.socket.close();
    this.socket = undefined;
    this.emit("close");
  }

  /**
   * For additional info refer to `Transport Layer` section of SSP_Manual.pdf
   */
  private handleData = (buffer: Buffer) => {
    if (!this.commands) {
      this.emit("error", new Error("Commands are not initialized"));
      return;
    }
    let ix = 0;
    do {
      const len = buffer[2] + 5;
      const buf = Buffer.alloc(len);
      buffer.copy(buf, 0, ix, ix + len);
      emitEventFromBuffer(buf, this.emit, this.commands);
      ix += len;
    } while (ix < buffer.length);
  };
}

export default SSP;
