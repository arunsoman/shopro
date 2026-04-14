/**
 * Multi-Agent System - Extensions Index
 * 
 * Exports all extensions for the multi-agent system.
 */

import memoryExtension from "./memory-extension.js";
import compactionExtension from "./compaction-extension.js";

export { memoryExtension, compactionExtension };

export const extensions = {
  memory: memoryExtension,
  compaction: compactionExtension,
};

export default { memory: memoryExtension, compaction: compactionExtension };
