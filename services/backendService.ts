
// Fixed: Import for BackendAnalysisResult from types.ts
import type { BackendAnalysisResult } from '../types';

/**
 * Creates a deterministic numeric hash from a string.
 * Used to generate consistent simulation inputs from text.
 * @param str The input string.
 * @returns A number between 0 and 1.
 */
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return (hash & 0x7fffffff) / 0x7fffffff;
};

/**
 * Mocks the backend analysis service.
 * This function simulates the Python "Brain" by converting text into a numeric
 * representation that can be fed into the frontend physics simulation.
 * It removes the need for a running Python backend and an API token.
 *
 * @param text The input text from the user.
 * @returns A promise that resolves to a BackendAnalysisResult object.
 */
export const analyzeText = async (text: string): Promise<BackendAnalysisResult> => {
    // This is a mock implementation that simulates the backend.
    
    // Simulate pattern_strength based on text length and variability.
    const normalizedLength = Math.min(text.length / 1000, 1); // Normalize length up to 1000 chars
    const variability = (new Set(text.split(''))).size / (text.length || 1);
    const pattern_strength = Math.min(0.2 + normalizedLength * 0.5 + variability * 0.3, 1.0);

    // Simulate syntropy_level based on a hash of the text content.
    const syntropy_level = 0.5 + (simpleHash(text) - 0.5) * 0.4; // between 0.3 and 0.7

    // Generate a 2D numeric array ('brain wave') from the text.
    const outputGrid: number[][] = Array.from({ length: 10 }, () => new Array(10).fill(0));
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const x = i % 10;
        const y = Math.floor(i / 10) % 10;
        // Add and normalize character code
        outputGrid[y][x] = (outputGrid[y][x] + (charCode / 255.0)) % 1.0;
    }
    
    // Create a slight blur/diffusion effect to make it more 'organic'
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const up = outputGrid[(y + 9) % 10][x];
            const down = outputGrid[(y + 1) % 10][x];
            const left = outputGrid[y][(x + 9) % 10];
            const right = outputGrid[y][(x + 1) % 10];
            outputGrid[y][x] = (outputGrid[y][x] * 0.6) + ((up + down + left + right) / 4) * 0.4;
        }
    }

    const result: BackendAnalysisResult = {
        output: outputGrid,
        pattern_strength: pattern_strength,
        syntropy_level: syntropy_level,
        timestamp: new Date().toISOString(),
        text_length: text.length,
    };

    // Simulate a network delay to feel more realistic
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

    return result;
};
