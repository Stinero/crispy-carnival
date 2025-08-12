/**
 * ===============================================================
 * Gemini Neural Swarm UI - Server Utilities
 * ===============================================================
 *
 * This file contains utility functions used across the backend services.
 */

/**
 * Creates a line-by-line diff string between two texts.
 * @param text1 The original text.
 * @param text2 The new text.
 * @returns A string with lines prefixed by ' ', '+', or '-'.
 */
export function createDiff(text1: string, text2: string): string {
    const oldLines = text1.split('\n');
    const newLines = text2.split('\n');
    const diffLines: string[] = [];
    const maxLen = Math.max(oldLines.length, newLines.length);

    // This is a simple, naive diff implementation. For more complex scenarios,
    // a library like 'diff' would be more appropriate.
    for (let i = 0; i < maxLen; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];
        if (oldLine === newLine) {
            diffLines.push(`  ${oldLine || ''}`);
        } else {
            if (oldLine !== undefined) diffLines.push(`- ${oldLine}`);
            if (newLine !== undefined) diffLines.push(`+ ${newLine}`);
        }
    }
    return diffLines.join('\n');
}
