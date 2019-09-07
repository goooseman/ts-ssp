# Typescript Smiley ® Secure Protocol

> NodeJS library to work with coin and bill acceptors under SSP protocol. Based on the [work](https://github.com/soulman-is-good/node-ssp) by [soulman-is-good](https://github.com/soulman-is-good).

**Warning!** Library is not yet tested and published.

### Supported devices

- NV10
- NV9 (not tested)

You are always welcome to add implementation to another device. Theoritically, you just need to add commands list to `src/commands`, a device name to `SSPType` type and check out event codes in `src/events.ts`.

### Installation

`npm install ts-ssp`

### Methods

- `open: () => Promise<void>` - initializes connection to device
- `close: () => Promise<void>` - stops connection to device
- `enable: () => Promise<void>` - enables money receiving
- `disable: () => Promise<void>` - disabled money receiving
- `commands.exec: (commandName?: string, ...commandArguments: number[]) => Promise<void>` - Adds a command to command stack and execute it. If no commandName is passed, just executes the command stack
- `on: (eventName: string, eventHandler: (...args: number[])) => void` - Attaches event handler
- `off: (eventName: string, eventHandler: (...args: number[])) => void` - Dettaches event handler
- `isOpened: () => boolean` - is connection to device opened
- `isEnabled: () => boolean` - is money receiving enabled

### Events

- `start` - emits after device is initialized
- `close` - emits after device is disconnected
- `error` - emits when any error occured
- other events supported by SSP protocol like `slave_reset`, `read_note`, `credit_note`, `note_rejecting`, `note_stacking`, `disabled`

### Examples

- [Basic example with ILS](./examples/ils-default.ts) (`npm run examples:ils-default` to run it)
