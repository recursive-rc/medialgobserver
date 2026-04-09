import { describe, it, expect } from 'vitest';
import { runHuffman } from './huffman';

describe('Huffman Coding Algorithm', () => {
  it('should handle an empty string gracefully', () => {
    const result = runHuffman('');
    expect(result.length).toBe(0);
  });

  it('should compute frequencies and build tree correctly for BCCABBDDAE', () => {
    // String length: 10
    // Frequencies:
    // A: 2, B: 3, C: 2, D: 2, E: 1
    const result = runHuffman('BCCABBDDAE');
    
    expect(result.length).toBeGreaterThan(0);
    
    // The final step should have a fully built tree
    const finalStep = result[result.length - 1];
    expect(finalStep).toBeDefined();
    
    const state = finalStep.data;
    expect(state.activeQueueIds.length).toBe(1); // Only root left
    
    const rootId = state.activeQueueIds[0];
    const rootNode = state.allNodes[rootId];
    
    expect(rootNode).toBeDefined();
    expect(rootNode.freq).toBe(10); // Sum of all frequencies
  });

  it('should assign edges properly in the state', () => {
    const result = runHuffman('ABCA');
    // A: 2, B: 1, C: 1
    const finalStep = result[result.length - 1];
    const state = finalStep.data;
    
    // Check that edges (edgeLabel) are assigned
    const nodes = Object.values(state.allNodes);
    
    // Children of the main root must have edge labels
    const has0 = nodes.some(n => n.edgeLabel === '0');
    const has1 = nodes.some(n => n.edgeLabel === '1');
    expect(has0).toBe(true);
    expect(has1).toBe(true);
  });
});
