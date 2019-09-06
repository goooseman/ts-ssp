import { OpenOptions } from "serialport";

export type SSPType = "nv10usb" | "nv9usb";
export type SSPParity = "none" | "even" | "mark" | "odd" | "space";
export type SSPOptions = {
  /**
   * 'npx @serialport/list' to get a list
   */
  device: string;
  /**
   * e.g. [1, 0, 1]
   */
  currencies: number[];
  /**
   * Default is 9600
   */
  baudRate?: OpenOptions["baudRate"];
  /**
   * Default is 8
   */
  dataBits?: OpenOptions["dataBits"];
  /**
   * Default is 2
   */
  stopbits?: OpenOptions["stopBits"];
  /**
   * Default is none
   */
  parity?: SSPParity;
  /**
   * Default is 0
   */
  sspID?: number;
  /**
   * Default is 0x80
   */
  sequence?: number;
};
