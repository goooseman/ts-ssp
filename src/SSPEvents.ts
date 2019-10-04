import SSPCommands from "./SSPCommands";
import { SSPType } from "./types";

// tslint:disable-next-line: cyclomatic-complexity
const getEventFromEventCode = <Type extends SSPType>(
  eventCode: number,
  eventData: number,
  commands: SSPCommands<Type>,
): [string, number?] => {
  switch (eventCode) {
    case 0xf1: //all
      return ["slave_reset"];
    case 0xef: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      return ["read_note", eventData];
    case 0xee: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      return ["credit_note", eventData];
    case 0xed: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      return ["note_rejecting"];
    case 0xec: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      //recieve reject code
      void commands.exec("last_reject_code");
    case 0xcc: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      return ["note_stacking"];
    case 0xeb: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      return ["note_stacked"];
    case 0xea: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      return ["safe_note_jam"];
    case 0xe9: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      return ["unsafe_note_jam"];
    case 0xe8: //all
      return ["disabled"];
    case 0xe6: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|nv201|SMART Payout|nv11|SMART Hopper
      return ["fraud_attempt", eventData];
    case 0xe7: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      return ["stacker_full"];
    case 0xe1: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|nv201|SMART Payout|nv11
      return ["note_cleared_from_front", eventData];
    case 0xe2: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|nv201|SMART Payout|nv11
      return ["note_cleared_to_cashbox", eventData];
    case 0xe3: //bv50|bv100|nv200|SMART Payout|nv11
      return ["cashbox_removed"];
    case 0xe4: //bv50|bv100|nv200|SMART Payout|nv11
      return ["cashbox_replaced"];
    case 0xe5: //nv200|nv201
      return ["barcode_ticket_validated"];
    case 0xd1: //nv200|nv201
      return ["barcode_ticket_acknowledge"];
    case 0xe0: //nv200
      return ["note_path_open"];
    case 0xb5: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|SMART Payout|nv11
      return ["channel_disable"];
    case 0xb6: //bv20|bv50|bv100|nv9usb|nv10usb|nv200|nv201|SMART Payout|nv11|SMART Hopper
      return ["initialing"];
    case 0xda: //SMART payout|SMART Hopper|nv11
      return ["dispensing", eventData];
    case 0xd2: //SMART payout|SMART Hopper|nv11
      return ["dispensed", eventData];
    // case 0xd2: //SMART payout|SMART Hopper|nv11
    // TODO check out this code, it was dublicated
    // return ["jammed", eventData];
    case 0xd6: //SMART payout|SMART Hopper|nv11
      return ["halted", eventData];
    case 0xd7: //SMART payout|SMART Hopper
      return ["floating", eventData];
    case 0xd8: //SMART payout|SMART Hopper
      return ["floated", eventData];
    case 0xd9: //SMART payout|SMART Hopper|nv11
      return ["timeout", eventData];
    case 0xdc: //SMART payout|SMART Hopper|nv11
      return ["incomplete_payout", eventData];
    case 0xdd: //SMART payout|SMART Hopper|nv11
      return ["incomplete_payout", eventData];
    case 0xde: //SMART Hopper
      return ["cashbox_paid", eventData];
    case 0xdf: //SMART Hopper
      return ["coin_credit", eventData];
    case 0xc4: //SMART Hopper
      return ["coin_mech_jammed"];
    case 0xc5: //SMART Hopper
      return ["coin_mech_return_pressed"];
    case 0xb7: //SMART Hopper
      return ["coin_mech_error"];
    case 0xc2: //SMART payout|SMART Hopper|nv11
      return ["emptying"];
    case 0xc3: //SMART payout|SMART Hopper|nv11
      return ["emptied"];
    case 0xb3: //SMART payout|SMART Hopper|nv11
      return ["smart_emptying", eventData];
    case 0xb4: //SMART payout|SMART Hopper|nv11
      return ["smart_emptied", eventData];
    case 0xdb: //SMART payout|nv11
      return ["note_stored_in_payout", eventData];
    case 0xc6: //SMART payout|nv11
      return ["payout_out_of_service"];
    case 0xb0: //SMART payout
      return ["jam_recovery"];
    case 0xb1: //SMART payout
      return ["error_during_payout"];
    case 0xc9: //SMART payout|nv11
      return ["note_transfered to stacker", eventData];
    case 0xce: //SMART payout|nv11
      return ["note_held_in_bezel", eventData];
    case 0xcb: //SMART payout|nv11
      return ["note_paid_into_store_at_powerup", eventData];
    // case 0xcb: //SMART payout|nv11
    // TODO check out this code, it was dublicated
    // return ["note_paid_into_stacker_at_powerup", eventData];
    case 0xcd: //nv11
      return ["note_dispensed_at_powerup", eventData];
    case 0xc7: //nv11
      return ["note_float_removed"];
    case 0xc8: //nv11
      return ["note_float_attached"];
    // case 0xc9: //nv11
    // TODO check out this code, it was dublicated
    // return ["device_full"];
    //Reject reasons
    case 0x0:
    case 0x1:
    case 0x2:
    case 0x3:
    case 0x4:
    case 0x5:
    case 0x6:
    case 0x7:
    case 0x8:
    case 0x9:
    case 0xa:
    case 0xb:
    case 0xc:
    case 0xd:
    case 0xe:
    case 0xf:
    case 0x10:
    case 0x11:
    case 0x12:
    case 0x13:
    case 0x14:
    case 0x15:
    case 0x16:
    case 0x17:
    case 0x18:
    case 0x19:
    case 0x1a:
    case 0x1b:
    case 0x1c:
      return ["note_rejected", eventCode];
    default:
      throw new Error("Unknown event");
  }
};

export const getErrorMessageFromErrorCode = (
  errorCode: number,
): string | undefined => {
  switch (errorCode) {
    case 0xf2:
      return "Command not known";
    case 0xf3:
      return "Wrong no parameters";
    case 0xf4:
      return "Parameter out of range";
    case 0xf5:
      return "Command cannot be processed";
    case 0xf6:
      return "Software error";
    case 0xf8:
      return "Fail";
    case 0xfa:
      return "Key not set";
    case 0xf0:
      // OK
      return undefined;
    default:
      return `Unknown error code ${errorCode}`;
  }
};

export const getEventFromBuffer = <Type extends SSPType>(
  buffer: Buffer,
  commands: SSPCommands<Type>,
  // tslint:disable-next-line: no-any
): [string, ...any[]] => {
  if (buffer[0] !== 0x7f) {
    return ["unregistered_data", buffer];
  }
  const buf = buffer.toJSON();
  const data: number[] = buf.data.slice(3, buffer[2] + 3);
  const crc = commands.crc16(data.slice(1, data[2] + 3));
  if (data[data.length - 2] !== crc[0] && data[data.length - 1] !== crc[1]) {
    return ["error", new Error("Wrong CRC from validator"), buffer, crc];
  }
  const errorCode = data[0];
  const errorMessage = getErrorMessageFromErrorCode(errorCode);
  if (errorMessage) {
    return ["error", new Error(errorMessage), buffer];
  }
  if (data.length < 2) {
    throw new Error("Incorrect data length");
  }

  const eventCode = data[1];
  const eventData = data[2];
  const event = getEventFromEventCode(eventCode, eventData, commands);

  return [event[0], event[1]];
};
