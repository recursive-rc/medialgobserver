import { describe, it, expect } from 'vitest';
import { runLZWEncode, runLZWDecode } from './lzw';

describe('LZW Algorithm', () => {

  it('should encode string correctly', () => {
    // A known LZW example sequence "BABAABAAA"
    // Output: 66, 65, 257, 258, 65, 261
    const steps = runLZWEncode("BABAABAAA");
    const finalStep = steps[steps.length - 1];
    
    expect(finalStep).toBeDefined();
    expect(finalStep.data.output).toEqual([66, 65, 257, 258, 65, 261]);
  });

  it('should decode sequence correctly', () => {
    // Decoding the same sequence
    const codes = [66, 65, 257, 258, 65, 261];
    const steps = runLZWDecode(codes);
    const finalStep = steps[steps.length - 1];
    
    expect(finalStep).toBeDefined();
    expect(finalStep.data.output).toEqual("BABAABAAA");
  });

  it('should handle special decoding case (currCode == nextCode)', () => {
    // BABAABAAA triggers this exact special case!
    // At step where it reads 261, 261 was just about to be added to the dictionary.
    // "AA" was added as 261 but we read 261 before dictionary formally has it from decoding state machine.
    // Let's test that specifically
    const input = "ABABABA";
    const encodedSteps = runLZWEncode(input);
    const codes = encodedSteps[encodedSteps.length - 1].data.output;
    // Expected codes for "ABABABA":
    // 'A': 65
    // 'B': 66  (add AB: 257)
    // 'AB': 257 (add BA: 258)
    // 'ABA': 259 ? No let's trace ABABABA
    // A=65, add AB=257
    // B=66, add BA=258
    // AB=257, add BAB=259
    // ABA=259 (since W=BA and K=A... wait)
    // The decoder will trigger the special case here!
    const decodedSteps = runLZWDecode(codes);
    expect(decodedSteps[decodedSteps.length - 1].data.output).toEqual(input);
  });
});
