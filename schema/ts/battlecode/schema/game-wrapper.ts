// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';

import { EventWrapper } from '../../battlecode/schema/event-wrapper';


/**
 * If events are not otherwise delimited, this wrapper structure
 * allows a game to be stored in a single buffer.
 * The first event will be a GameHeader; the last event will be a GameFooter.
 * matchHeaders[0] is the index of the 0th match header in the event stream,
 * corresponding to matchFooters[0]. These indices allow quick traversal of
 * the file.
 */
export class GameWrapper {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):GameWrapper {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

static getRootAsGameWrapper(bb:flatbuffers.ByteBuffer, obj?:GameWrapper):GameWrapper {
  return (obj || new GameWrapper()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

static getSizePrefixedRootAsGameWrapper(bb:flatbuffers.ByteBuffer, obj?:GameWrapper):GameWrapper {
  bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
  return (obj || new GameWrapper()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
}

/**
 * The series of events comprising the game.
 */
events(index: number, obj?:EventWrapper):EventWrapper|null {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? (obj || new EventWrapper()).__init(this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4), this.bb!) : null;
}

eventsLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 4);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

/**
 * The indices of the headers of the matches, in order.
 */
matchHeaders(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.readInt32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
}

matchHeadersLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

matchHeadersArray():Int32Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 6);
  return offset ? new Int32Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

/**
 * The indices of the footers of the matches, in order.
 */
matchFooters(index: number):number|null {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.readInt32(this.bb!.__vector(this.bb_pos + offset) + index * 4) : 0;
}

matchFootersLength():number {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
}

matchFootersArray():Int32Array|null {
  const offset = this.bb!.__offset(this.bb_pos, 8);
  return offset ? new Int32Array(this.bb!.bytes().buffer, this.bb!.bytes().byteOffset + this.bb!.__vector(this.bb_pos + offset), this.bb!.__vector_len(this.bb_pos + offset)) : null;
}

static startGameWrapper(builder:flatbuffers.Builder) {
  builder.startObject(3);
}

static addEvents(builder:flatbuffers.Builder, eventsOffset:flatbuffers.Offset) {
  builder.addFieldOffset(0, eventsOffset, 0);
}

static createEventsVector(builder:flatbuffers.Builder, data:flatbuffers.Offset[]):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addOffset(data[i]!);
  }
  return builder.endVector();
}

static startEventsVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static addMatchHeaders(builder:flatbuffers.Builder, matchHeadersOffset:flatbuffers.Offset) {
  builder.addFieldOffset(1, matchHeadersOffset, 0);
}

static createMatchHeadersVector(builder:flatbuffers.Builder, data:number[]|Int32Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createMatchHeadersVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createMatchHeadersVector(builder:flatbuffers.Builder, data:number[]|Int32Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt32(data[i]!);
  }
  return builder.endVector();
}

static startMatchHeadersVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static addMatchFooters(builder:flatbuffers.Builder, matchFootersOffset:flatbuffers.Offset) {
  builder.addFieldOffset(2, matchFootersOffset, 0);
}

static createMatchFootersVector(builder:flatbuffers.Builder, data:number[]|Int32Array):flatbuffers.Offset;
/**
 * @deprecated This Uint8Array overload will be removed in the future.
 */
static createMatchFootersVector(builder:flatbuffers.Builder, data:number[]|Uint8Array):flatbuffers.Offset;
static createMatchFootersVector(builder:flatbuffers.Builder, data:number[]|Int32Array|Uint8Array):flatbuffers.Offset {
  builder.startVector(4, data.length, 4);
  for (let i = data.length - 1; i >= 0; i--) {
    builder.addInt32(data[i]!);
  }
  return builder.endVector();
}

static startMatchFootersVector(builder:flatbuffers.Builder, numElems:number) {
  builder.startVector(4, numElems, 4);
}

static endGameWrapper(builder:flatbuffers.Builder):flatbuffers.Offset {
  const offset = builder.endObject();
  return offset;
}

static createGameWrapper(builder:flatbuffers.Builder, eventsOffset:flatbuffers.Offset, matchHeadersOffset:flatbuffers.Offset, matchFootersOffset:flatbuffers.Offset):flatbuffers.Offset {
  GameWrapper.startGameWrapper(builder);
  GameWrapper.addEvents(builder, eventsOffset);
  GameWrapper.addMatchHeaders(builder, matchHeadersOffset);
  GameWrapper.addMatchFooters(builder, matchFootersOffset);
  return GameWrapper.endGameWrapper(builder);
}
}
