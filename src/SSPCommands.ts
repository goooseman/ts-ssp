import serialport from "serialport";
import { promisify } from "util";
import { Commands } from "./commands";
import { sleep } from "./utils";

class SSPCommands<CommandsList extends Commands> {
  public commandsList: CommandsList;
  private execStack: number[][];
  private socket: serialport;
  private sspId: number;
  private sequence: number;
  private sequenceNumber: number;

  constructor(
    socket: serialport,
    commandsList: CommandsList,
    sspId: number,
    sequence: number,
  ) {
    this.socket = socket;
    this.sspId = sspId;
    this.sequence = this.sequenceNumber = sequence;
    this.commandsList = commandsList;
    this.execStack = [];
  }

  public async exec(commandName?: keyof CommandsList) {
    if (commandName) {
      this.stack(commandName);
    }

    const execLine = this.execStack.shift();
    if (!execLine) {
      return;
    }
    const writeAsync = promisify(this.socket.write);
    await writeAsync(execLine);
    const drainAsync = promisify(this.socket.drain);
    await drainAsync();
    await sleep(100);
    void this.exec();
  }

  private getSequence() {
    return (
      this.sspId |
      (this.sequence =
        this.sequence === this.sequenceNumber ? 0x00 : this.sequenceNumber)
    );
  }

  private crc16(commandLine: number[]) {
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

  private stack(commandName: keyof CommandsList, ...args: number[]) {
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
