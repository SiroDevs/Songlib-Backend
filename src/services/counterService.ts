import { Acounter } from "../models";

export class CounterService {
  /**
   * Get current sequence value
   */
  static async getSequence(counterName: string) {
    const counter = await Acounter.findOne({ _id: counterName });
    if (!counter) {
      // Create counter if it doesn't exist
      const newCounter = await Acounter.create({ _id: counterName, seq: 0 });
      return newCounter.seq;
    }
    return counter.seq;
  }

  static async getNextSequence(counterName: string) {
    const counter = await Acounter.findOne({ _id: counterName });
    if (!counter) {
      // Create counter and return first sequence
      const newCounter = await Acounter.create({ _id: counterName, seq: 1 });
      return newCounter.seq;
    }
    return counter.seq + 1;
  }

  /**
   * Increment sequence and return new value
   */
  static async incrementSequence(counterName: string) {
    const counter = await Acounter.findOneAndUpdate(
      { _id: counterName },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return counter.seq;
  }

  /**
   * Set sequence to specific value
   */
  static async setSequence(counterName: string, value: number) {
    const counter = await Acounter.findOneAndUpdate(
      { _id: counterName },
      { seq: value },
      { new: true, upsert: true }
    );
    return counter.seq;
  }

}