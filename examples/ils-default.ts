// tslint:disable-next-line: no-relative-imports
import { SSP } from "../src";

// tslint:disable: no-console
const start = async () => {
  const notes: {
    [key: number]: string;
  } = {
    1: "20ILS",
    2: "50ILS",
    3: "100ILS",
    4: "200ILS",
  } as const;

  const ssp = new SSP("nv10usb", {
    device: "/dev/tty.SLAB_USBtoUART", //device address, use 'npx @serialport/list' to get a list
    currencies: [0, 1, 1, 1], //currencies types acceptable. Here all but 20ILS
  });

  console.log("before open");
  await ssp.open();
  console.log("opened");
  await ssp.enable();
  console.log("enabled");

  ssp.on("read_note", async (note: number) => {
    if (note > 0) {
      console.log("Ohhh, some cash!", notes[note]);
      if (note === 3) {
        // suddenly we decided that we don't need 100 ILS
        await ssp.exec("reject_banknote");
      }
    }
  });
  ssp.on("disable", () => {
    console.log("disabled");
  });
  ssp.on("note_cleared_from_front", (note: number) => {
    console.log("note_cleared_from_front", notes[note]);
  });
  ssp.on("note_cleared_to_cashbox", (note: number) => {
    console.log("note_cleared_to_cashbox", notes[note]);
  });
  ssp.on("credit_note", (note: number) => {
    console.log("CREDIT", notes[note]);
  });
  ssp.on("safe_note_jam", (note: number) => {
    console.log("Jammed", notes[note]);
  });
  ssp.on("unsafe_note_jam", (note: number) => {
    console.log("Jammed inside", notes[note]);
  });
  ssp.on("fraud_attempt", (note: number) => {
    console.log("Fraud!", notes[note]);
  });
  ssp.on("stacker_full", (note: number) => {
    console.log("I'm full, do something!", notes[note]);
  });
  ssp.on("note_rejected", (reason: number) => {
    console.log("Rejected!", reason);
  });
  ssp.on("error", (err: Error) => {
    console.error(err.message);
  });

  process.on("SIGINT", () => {
    process.exit(0);
  });

  process.on("exit", () => {
    void ssp.disable();
  });

  process.on("uncaughtException", (err: Error) => {
    console.error(err);
    process.exit(1);
  });
};

void start();
