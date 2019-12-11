import { EventEmitter } from "events";
import Serialport from "serialport";
import SSPCommands from "./SSPCommands";
import { getEventFromBuffer } from "./SSPEvents";
import SSPParser from "./SSPParser/SSPParser";
import { SSPOptions, SSPType } from "./types";
import { sleep } from "./utils";

class SSP<Type extends SSPType = "nv10usb"> extends EventEmitter {
  private commands?: SSPCommands<Type>;
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

  public exec(
    commandName: keyof SSPCommands<Type>["commandsList"],
    ...args: number[]
  ): Promise<void> {
    if (!this.commands) {
      throw new Error("Comamnds are not avalible");
    }
    return this.commands.exec(commandName, ...args);
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
    const parser = this.socket.pipe(new SSPParser());
    this.socket.on("close", () => {
      this.emit("close");
    });
    this.socket.on("error", (err: Error) => {
      this.emit("error", err);
    });
    parser.on("data", this.handleData);
    const openAsync = (socket: SerialPort) =>
      new Promise((resolve, reject) => {
        socket.open((err?: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
          return;
        });
      });
    await openAsync(this.socket);
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
    const closeAsync = (socket: SerialPort) =>
      new Promise((resolve, reject) => {
        socket.close((err?: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
          return;
        });
      });
    await closeAsync(this.socket);
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
    try {
      const eventToEmit = getEventFromBuffer(buffer, this.commands);
      if (!eventToEmit) {
        return;
      }
      this.emit(...eventToEmit);
    } catch (e) {
      console.error(e);
    }
  };
}

export default SSP;
