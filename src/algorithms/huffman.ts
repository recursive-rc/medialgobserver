import type { AlgorithmResult } from '../types/algorithm';

export interface HuffmanNode {
  id: string;        // unique id, e.g. "C_A" for char A, or "N1"
  label: string;     // 'A' or 'N1'
  freq: number;
  leftId?: string;
  rightId?: string;
  edgeLabel?: "0" | "1"; // e.g. left gets 0, right gets 1
  x: number;
  y: number;
}

export interface HuffmanState {
  input: string;
  allNodes: Record<string, HuffmanNode>; // Master list of nodes to render
  activeQueueIds: string[];              // Node IDs currently in the forest/queue
  highlightedNodeIds: string[];          // Highlighted nodes
  highlightedEdgeIds: string[];          // Highlighted edges, formatted as "sourceId-targetId"
  rootId: string | null;                 // The root of the final tree
  encodingPath?: string;                 // The string representing binary encoding
  freqs: Record<string, number>;         // Frequency table
}

export const HUFFMAN_PSEUDOCODE = [
  "Compute freq. for each char",
  "Create node for each char",
  "Sort nodes by freq.",
  "While ≥ 1 node left:",
  "  Find 2 nodes with smallest freq.",
  "  Create new parent node",
  "  Parent freq = sum of children's freqs",
  "  Remove child nodes from consideration",
  "Assign each edge 0 or 1",
  "Huffman code = path from root to leaf"
];

// Helper to pre-calculate tree layout
function calculateTreeLayout(rootId: string, nodes: Record<string, HuffmanNode>) {
  // 1. Calculate depths
  const depths: Record<string, number> = {};
  let maxDepth = 0;
  
  const computeDepth = (id: string, depth: number) => {
    depths[id] = depth;
    maxDepth = Math.max(maxDepth, depth);
    const node = nodes[id];
    if (node.leftId) computeDepth(node.leftId, depth + 1);
    if (node.rightId) computeDepth(node.rightId, depth + 1);
  };
  computeDepth(rootId, 0);

  // 2. Assing X based on in-order leaf traversal, and Y based on reversed depth
  let leafX = 0;
  
  const computePos = (id: string) => {
    const node = nodes[id];
    
    // leaf node
    if (!node.leftId && !node.rightId) {
      node.x = leafX;
      leafX++;
    } else {
      if (node.leftId) computePos(node.leftId);
      if (node.rightId) computePos(node.rightId);
      
      const leftX = node.leftId ? nodes[node.leftId].x : 0;
      const rightX = node.rightId ? nodes[node.rightId].x : 0;
      node.x = (leftX + rightX) / 2;
    }
    
    // y based on depth (maxDepth is bottom, 0 is top)
    // Actually visual logic mapping:
    // root is at depth 0, so visually it should be at Y=0
    // leaves are at bottom
    node.y = depths[id];
  };
  
  computePos(rootId);
}

export function runHuffman(input: string): AlgorithmResult<HuffmanState> {
  const steps: AlgorithmResult<HuffmanState> = [];
  if (!input) return steps;

  // Initial step structures
  const allNodes: Record<string, HuffmanNode> = {};
  const activeQueueIds: string[] = [];
  let rootId: string | null = null;
  
  // Custom helper to quickly take a snapshot
  const addStep = (
    highlightedLines: number[],
    explanation: string,
    activeIds: string[],
    highlightNodes: string[] = [],
    highlightEdges: string[] = [],
    meta?: Record<string, string | number | boolean | null>
  ) => {
    // deep copy allNodes to preserve history
    const nodesCopy: Record<string, HuffmanNode> = JSON.parse(JSON.stringify(allNodes));
    steps.push({
      data: {
        input,
        allNodes: nodesCopy,
        activeQueueIds: [...activeIds],
        highlightedNodeIds: highlightNodes,
        highlightedEdgeIds: highlightEdges,
        rootId,
        freqs
      },
      highlightedLines,
      explanation,
      metadata: meta || {}
    });
  };

  // 1. Compute freq for each char
  const freqs: Record<string, number> = {};
  for (const char of input) {
    freqs[char] = (freqs[char] || 0) + 1;
  }
  const uniqueChars = Object.keys(freqs).sort(); // Sort to preserve tie-breaking stability
  addStep([1], `Computed frequencies for input string of length ${input.length}.`, [], [], [], {
    "Unique Chars": uniqueChars.length,
    "Frequencies": Object.entries(freqs).map(([c, f]) => `${c}:${f}`).join(", ")
  });

  // 2. Create node for each char
  const tempChars = [...uniqueChars];
  for (const char of tempChars) {
    const id = `C_${char}`;
    allNodes[id] = { id, label: char, freq: freqs[char], x: 0, y: 0 };
    activeQueueIds.push(id);
  }

  // Pre-calculate tree visually by simulating the build process in a replica
  const simNodes = JSON.parse(JSON.stringify(allNodes));
  const simQueue = [...activeQueueIds];
  let simNextNodeId = 1;

  while(simQueue.length > 1) {
    simQueue.sort((a, b) => simNodes[a].freq !== simNodes[b].freq ? simNodes[a].freq - simNodes[b].freq : a.localeCompare(b));
    const leftId = simQueue.shift()!;
    const rightId = simQueue.shift()!;
    const parentId = `N${simNextNodeId++}`;
    simNodes[parentId] = {
      id: parentId, label: parentId,
      freq: simNodes[leftId].freq + simNodes[rightId].freq,
      leftId, rightId, x: 0, y: 0
    };
    simQueue.push(parentId);
  }
  // Compute positions on this simulated full tree
  if (simQueue.length === 1) {
    rootId = simQueue[0];
    calculateTreeLayout(rootId, simNodes);
  } else {
    rootId = activeQueueIds[0];
    simNodes[rootId].x = 0;
    simNodes[rootId].y = 0;
  }
  rootId = null; // Reset for actual run

  // Assign precalculated x, y immediately
  for (const id of activeQueueIds) {
    allNodes[id].x = simNodes[id].x;
    allNodes[id].y = simNodes[id].y;
  }

  addStep([2], "Created an initial node for each unique character.", activeQueueIds, activeQueueIds, [], { "Active Nodes": activeQueueIds.length });

  // 3. Sort nodes by freq
  activeQueueIds.sort((a, b) => {
    if (allNodes[a].freq !== allNodes[b].freq) {
      return allNodes[a].freq - allNodes[b].freq;
    }
    return a.localeCompare(b);
  });
  addStep([3], "Sorted nodes by frequency (ascending).", activeQueueIds, activeQueueIds, [], {
    "Remaining": activeQueueIds.map(id => `${allNodes[id].label}(${allNodes[id].freq})`).join(", ")
  });

  let nextParentIdNum = 1;

  // 4. While >= 1 node left (since we break on 1, logic is strictly > 1 internally for merges)
  if (activeQueueIds.length === 1) {
    addStep([4], "Only one node exists. Tree is complete.", activeQueueIds, activeQueueIds, []);
  }

  while (activeQueueIds.length > 1) {
    addStep([4], `${activeQueueIds.length} nodes remaining in consideration. Tree not complete yet.`, activeQueueIds, [], [], { "Nodes Left": activeQueueIds.length });

    // 5. Find 2 nodes with smallest freq
    // It's already sorted from the previous iteration/initialization!
    const leftId = activeQueueIds[0];
    const rightId = activeQueueIds[1];
    addStep([5], `Found 2 nodes with smallest frequencies: ${allNodes[leftId].label} (${allNodes[leftId].freq}) and ${allNodes[rightId].label} (${allNodes[rightId].freq}).`, activeQueueIds, [leftId, rightId], []);

    // 6. Create new parent node
    const parentId = `N${nextParentIdNum++}`;
    const parentFreq = allNodes[leftId].freq + allNodes[rightId].freq;
    
    allNodes[parentId] = {
      id: parentId,
      label: parentId,
      freq: parentFreq,
      leftId,
      rightId,
      x: simNodes[parentId].x,
      y: simNodes[parentId].y
    };
    
    addStep([6], `Create new parent node: ${parentId}.`, [...activeQueueIds, parentId], [parentId], [], {
      "New Parent": parentId
    });

    // 7. Parent freq = sum of children's freqs
    addStep([7], `Parent frequency = ${allNodes[leftId].freq} + ${allNodes[rightId].freq} = ${parentFreq}.`, [...activeQueueIds, parentId], [parentId, leftId, rightId], []);

    // 8. Remove child nodes from consideration
    activeQueueIds.splice(0, 2);
    activeQueueIds.push(parentId);
    // Sort again
    activeQueueIds.sort((a, b) => {
      if (allNodes[a].freq !== allNodes[b].freq) {
        return allNodes[a].freq - allNodes[b].freq;
      }
      return a.localeCompare(b);
    });

    addStep([8], `Removed children and added ${parentId}. Remaining nodes re-sorted.`, activeQueueIds, [parentId], [], {
       "Remaining": activeQueueIds.map(id => `${allNodes[id].label}(${allNodes[id].freq})`).join(", ")
    });
  }

  rootId = activeQueueIds[0];

  // 9. Assign each edge 0 or 1
  const assignEdges = (id: string) => {
    const node = allNodes[id];
    if (node.leftId) {
      allNodes[node.leftId].edgeLabel = "0";
      assignEdges(node.leftId);
    }
    if (node.rightId) {
      allNodes[node.rightId].edgeLabel = "1";
      assignEdges(node.rightId);
    }
  };
  if (rootId) assignEdges(rootId);

  // We highlight all edges recursively
  const allEdges: string[] = [];
  const getEdges = (id: string) => {
    const n = allNodes[id];
    if (n.leftId) { allEdges.push(`${id}-${n.leftId}`); getEdges(n.leftId); }
    if (n.rightId) { allEdges.push(`${id}-${n.rightId}`); getEdges(n.rightId); }
  }
  if (rootId) getEdges(rootId);

  addStep([9], "Assigned '0' to standard left edges and '1' to standard right edges.", activeQueueIds, [], allEdges, {});


  // 10. Huffman code = path from root to leaf
  // Let's trace the path to the first leaf node to illustrate.
  const pathNodes: string[] = [];
  const pathEdges: string[] = [];
  let encodingPath = "";
  
  if (rootId) {
    let curr = rootId;
    pathNodes.push(curr);
    while(allNodes[curr].leftId || allNodes[curr].rightId) {
      // follow left
      if (allNodes[curr].leftId) {
         pathEdges.push(`${curr}-${allNodes[curr].leftId}`);
         curr = allNodes[curr].leftId!;
         encodingPath += "0";
      } else {
         pathEdges.push(`${curr}-${allNodes[curr].rightId}`);
         curr = allNodes[curr].rightId!;
         encodingPath += "1";
      }
      pathNodes.push(curr);
    }
  }

  addStep([10], `Illustrated path from root to leaf '${allNodes[pathNodes[pathNodes.length-1]]?.label || ""}'. Encoding: ${encodingPath}`, activeQueueIds, pathNodes, pathEdges, {
    "Example Node": allNodes[pathNodes[pathNodes.length-1]]?.label || "",
    "Encoding": encodingPath
  });

  return steps;
}
