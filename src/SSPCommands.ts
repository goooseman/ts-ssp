import serialport from "serialport";
import commands from "./commands";
import { SSPType } from "./types";
import { sleep } from "./utils";

class SSPCommands<Type extends SSPType> {
  public commandsList: typeof commands[Type];
  private execStack: number[][];
  private socket: serialport;
  private sspId: number;
  private sequence: number;
  private sequenceNumber: number;

  constructor(socket: serialport, type: Type, sspId: number, sequence: number) {
    this.socket = socket;
    this.sspId = sspId;
    this.sequence = this.sequenceNumber = sequence;
    this.commandsList = commands[type];
    this.execStack = [];
  }

  public async exec(
    commandName?: keyof typeof commands[Type],
    ...args: number[]
  ) {
    if (commandName) {
      this.stack(commandName, ...args);
    }

    const execLine = this.execStack.shift();
    if (!execLine) {
      return;
    }
    const writeAsync = (command: number[]) =>
      new Promise((resolve, reject) => {
        this.socket.write(command, (err, bytesWritten) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(bytesWritten);
        });
      });
    await writeAsync(execLine);
    const drainAsync = () =>
      new Promise((resolve, reject) => {
        this.socket.drain((err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    await drainAsync();
    await sleep(100);
    void this.exec();
  }

  public crc16(commandLine: number[]) {
    const seed = 0xffff;
    const poly = 0x8005;
    let crc = seed;

    for (const command of commandLine) {
      crc ^= command << 8;

      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = ((crc << 1) & 0xffff) ^ poly;
        } else {
          crc <<= 1;
        }
      }
    }
    return [crc & 0xff, (crc >> 8) & 0xff];
  }

  private getSequence() {
    return (
      this.sspId |
      (this.sequence =
        this.sequence === this.sequenceNumber ? 0x00 : this.sequenceNumber)
    );
  }

  private stack(commandName: keyof typeof commands[Type], ...args: number[]) {
    if (!this.commandsList.hasOwnProperty(commandName)) {
      throw new Error(`Unknown command ${commandName}`);
    }
    const command = this.commandsList[commandName];
    if (command.sequence) {
      this.sequence = command.sequence;
    }
    let commandLine = [
      this.getSequence(),
      args.length + 1,
      command.value,
      ...args,
    ];
    commandLine = [0x7f, ...commandLine, ...this.crc16(commandLine)];
    this.execStack.push(commandLine);
  }
}

export default SSPCommands;
