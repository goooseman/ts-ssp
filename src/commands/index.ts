import NV10USBCommands from "./NV10USBCommands";
import NV9USBCommands from "./NV9USBCommands";

export interface Command {
  value: number;
  sequence?: number;
}

export interface Commands {
  [commandName: string]: Command;
}

export { NV9USBCommands, NV10USBCommands };
