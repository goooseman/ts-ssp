// Original https://github.com/soulman-is-good/node-ssp/blob/master/commands/nv9usb.js

export default {
  reset: { value: 0x01 },
  set_channel_inhibits: { value: 0x02 },
  display_on: { value: 0x03 },
  display_off: { value: 0x04 },
  setup_request: { value: 0x05 },
  host_protocol_version: { value: 0x06 },
  poll: { value: 0x07 },
  reject_banknote: { value: 0x08 },
  disable: { value: 0x09 },
  enable: { value: 0x0a },
  get_serial_number: { value: 0x0c },
  unit_data: { value: 0x0d },
  channel_value_request: { value: 0x0e },
  channel_security_data: { value: 0x0f },
  channel_reteach_data: { value: 0x10 },
  sync: {
    sequence: 0x80,
    value: 0x11,
  },
  enable_higher_protocol: { value: 0x13 },
  last_reject_code: { value: 0x17 },
  hold: { value: 0x18 },
  get_firmware_version: { value: 0x20 },
  get_dataset_version: { value: 0x21 },
  set_generator: { value: 0x4a },
  set_modulus: { value: 0x4b },
  request_key_exchange: { value: 0x4c },
  poll_with_ack: { value: 0x56 },
  event_ack: { value: 0x57 },
};
