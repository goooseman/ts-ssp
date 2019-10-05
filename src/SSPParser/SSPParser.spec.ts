import SSPParser from "./SSPParser";

const STX = 0x7f;
const SEQ = 0x10; // Random
const LENGTH = 0x5;
const DATA = [0xf, 0xf, 0xf];
const CRCL = 0;
const CRCH = 0;

const event = [STX, SEQ, LENGTH, ...DATA, CRCL, CRCH];

const randomBuffer = Buffer.from([0x64]);

it("should return input as it if correct message is sent in one batch", () => {
  const data = Buffer.from(event);
  const spy = jest.fn();
  const parser = new SSPParser();
  parser.on("data", spy);
  parser.write(data);
  expect(spy).toBeCalledTimes(1);
  expect(spy).toBeCalledWith(data);
});

it("should return one message, when it was transmitted in several batches", () => {
  const spy = jest.fn();
  const parser = new SSPParser();
  parser.on("data", spy);
  for (const part of event) {
    const data = Buffer.from([part]);
    parser.write(data);
  }
  expect(spy).toBeCalledTimes(1);
  expect(spy).toBeCalledWith(Buffer.from(event));
});

it("should return two message, when it was transmitted in several batches", () => {
  const spy = jest.fn();
  const parser = new SSPParser();
  parser.on("data", spy);
  for (const part of event) {
    const data = Buffer.from([part]);
    parser.write(data);
  }
  for (const part of event) {
    const data = Buffer.from([part]);
    parser.write(data);
  }
  expect(spy).toBeCalledTimes(2);
  expect(spy).toBeCalledWith(Buffer.from(event));
});

it("should return two message, when three extra bytes were sent in the start", () => {
  const spy = jest.fn();
  const parser = new SSPParser();
  parser.on("data", spy);
  parser.write(randomBuffer);
  parser.write(randomBuffer);
  parser.write(randomBuffer);
  for (const part of event) {
    const data = Buffer.from([part]);
    parser.write(data);
  }
  for (const part of event) {
    const data = Buffer.from([part]);
    parser.write(data);
  }
  expect(spy).toBeCalledTimes(2);
  expect(spy).toBeCalledWith(Buffer.from(event));
});
