import { SspType } from "@src/types";
import NV10USBCommands from "./NV10USBCommands";
import NV9USBCommands from "./NV9USBCommands";

export interface Command {
  value: number;
  sequence?: number;
}

export interface DeviceCommands {
  [commandName: string]: Command;
}

export type Commands = { [deviceName in SspType]: DeviceCommands };

const commands: Commands = {
  nv10usb: NV10USBCommands,
  nv9usb: NV9USBCommands,
};

export default commands;
