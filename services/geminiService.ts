import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types'; // Removed .ts extension

// Initialize AI Client
const getAiClient = () => new GoogleGenAI({apiKey: process.env.API_KEY});

/**
 * Helper function to generate a specific number of questions in a single batch.
 */
const generateBatch = async (count: number, difficulty: 'HARD' | 'EASY', startIndex: number): Promise<Question[]> => {
  const ai = getAiClient();
  const difficultyPrompt = difficulty === 'HARD'
    ? "Difficulty: Medium to High (700+ level). Focus on complex logic, traps, and multi-step reasoning."
    : "Difficulty: Low to Medium (500-600 level). Focus on building confidence. Questions should be straightforward applications of concepts with cleaner numbers and less convoluted logic. Ideal for warm-up.";

  const prompt = `
    You are an expert GMAT test creator specializing in the Quantitative section for the GMAT Focus Edition. 
    Generate a GMAT Quantitative problem set consisting of EXACTLY ${count} questions, returned as a JSON array.
    
    TOPIC RESTRICTIONS:
    - IMPORTANT: Do NOT generate any Geometry questions.
    - Focus strictly on Arithmetic, Algebra, and Word Problems.
    - ${difficultyPrompt}

    FORMATTING & LATEX REQUIREMENTS (CRITICAL):
    1. Output strictly valid JSON.
    2. Mathematical Expressions MUST be in LaTeX format.
       - Inline math: Enclose in single dollar signs, e.g., $x^2 + y = 10$.
       - Display math (centered, separate line): Enclose in double dollar signs, e.g., $$ \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$.
    3. JSON ESCAPING RULES:
       - Since you are outputting a JSON string, you MUST double-escape all backslashes in LaTeX commands.
       - CORRECT: "$\\frac{1}{2}$" (Becomes $\frac{1}{2}$ after parsing)
       - Example: Write "\\\\sqrt{x}" to produce $\sqrt{x}$.
    4. Text Formatting:
       - Use "\\n" for line breaks to separate paragraphs.

    STRUCTURE:
    - The set must be a balanced mix of Problem Solving (PS) and Data Sufficiency (DS) questions.
    - For Problem Solving (PS) questions, providing exactly 5 options labeled "A", "B", "C", "D", "E" is MANDATORY.
    - For Data Sufficiency (DS) questions, the 'options' array should be populated with the standard 5 DS options provided in the schema description (A-E).
    - Provide a detailed step-by-step explanation for each question, using LaTeX for all math.
    - The 'id' for each question should be a unique identifier string (e.g., 'AI-BATCH-${startIndex}-Q1').
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique identifier." },
              text: { type: Type.STRING, description: "Question text with LaTeX." },
              statements: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING, description: "Must be A, B, C, D, or E" },
                    text: { type: Type.STRING }
                  },
                  required: ["label", "text"]
                }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["id", "text", "options", "correctAnswer", "explanation"]
          }
        },
      },
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    return [];
  } catch (error) {
    console.error(`Batch generation failed for count ${count}:`, error);
    // Return empty array so Promise.all doesn't fail completely if one batch fails (though ideally we retry)
    return [];
  }
};

/**
 * Generates a complete GMAT Quantitative problem set using the Gemini API.
 * Uses PARALLEL REQUESTS to significantly speed up generation.
 * 
 * @param difficulty 'HARD' (default) for 700+ level, 'EASY' for 500-600 level warm-up.
 * @returns A promise that resolves to a Record of 21 questions.
 */
export const generateGmatQuestions = async (difficulty: 'HARD' | 'EASY' = 'HARD'): Promise<Record<number, Question>> => {
  // Strategy: 3 parallel requests of 7 questions each = 21 questions.
  // This reduces wait time to ~1/3rd of sequential generation.
  const BATCH_SIZE = 7;
  const NUM_BATCHES = 3;
  
  const promises = [];
  for (let i = 0; i < NUM_BATCHES; i++) {
    promises.push(generateBatch(BATCH_SIZE, difficulty, i));
  }

  try {
    const results = await Promise.all(promises);
    
    // Flatten the array of arrays
    const allQuestions = results.flat();
    
    if (allQuestions.length === 0) {
      throw new Error("AI failed to generate any questions.");
    }

    // Re-index questions to ensure keys are 1..21
    const questionsRecord: Record<number, Question> = {};
    allQuestions.forEach((q, index) => {
      // Ensure we limit to 21 just in case
      if (index < 21) {
        questionsRecord[index + 1] = q;
      }
    });

    return questionsRecord;

  } catch (error) {
    console.error("Error in parallel generation:", error);
    throw new Error("Failed to generate questions. Please try again.");
  }
};

/**
 * Generates variants (clones) based on specific "Real Exam" seed questions.
 * Handles parallel processing for speed.
 * 
 * @param seedTexts An array of strings, where each string is the text of a Real GMAT Question.
 * @param difficulty 'HARD' (default) keeps the original logic/complexity. 'EASY' attempts to simplify calculation steps.
 */
export const generateVariantsFromSeeds = async (seedTexts: string[], difficulty: 'HARD' | 'EASY' = 'HARD'): Promise<Record<number, Question>> => {
  const ai = getAiClient();

  // Helper to process a small chunk of seeds
  const processChunk = async (chunk: string[], chunkIndex: number): Promise<Question[]> => {
    const difficultyPrompt = difficulty === 'HARD'
      ? "Maintain the SAME level of complexity and logical traps as the original seed."
      : "SIMPLIFY the numbers and calculation steps slightly to make it a 'Warm-up' version (500-600 level), while keeping the core concept intact.";

    const prompt = `
      You are an expert GMAT Quant developer. I will provide you with a list of "Original Source Questions".
      
      YOUR TASK:
      For EACH source question in the list, generate exactly ONE "Digital Twin" (Variant) that:
      1. First, INTERPRET the messy input to understand the mathematical intent.
      2. Tests the EXACT same mathematical concept.
      3. Uses a similar logic path to solve.
      4. BUT has completely DIFFERENT numbers, variable names, and scenario/context.
      5. ${difficultyPrompt}
      6. MUST be strictly compatible with GMAT Focus Edition (No Geometry).
      7. ALL questions must have 5 options labeled "A", "B", "C", "D", "E".

      INPUT SEEDS (${chunk.length} questions):
      ${JSON.stringify(chunk)}

      OUTPUT FORMAT:
      Return a JSON Array of Question objects.
      
      LATEX & JSON REQUIREMENTS:
      - Double-escape backslashes.
      - Use $...$ for inline math.
      - Clean up any raw math symbols.
      - Output strictly valid JSON.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A unique ID, e.g., 'VARIANT-01'" },
                text: { type: Type.STRING, description: "The new variant question text." },
                statements: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Only for DS questions."
                },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "Must be A, B, C, D, or E" },
                      text: { type: Type.STRING }
                    },
                    required: ["label", "text"]
                  }
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING, description: "Explain the logic clearly." }
              },
              required: ["id", "text", "options", "correctAnswer", "explanation"]
            }
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (e) {
      console.error("Chunk processing failed", e);
      return [];
    }
  };

  // Split seeds into chunks of 5 for parallel processing
  const CHUNK_SIZE = 5;
  const chunks = [];
  for (let i = 0; i < seedTexts.length; i += CHUNK_SIZE) {
    chunks.push(seedTexts.slice(i, i + CHUNK_SIZE));
  }

  try {
     const promises = chunks.map((chunk, index) => processChunk(chunk, index));
     const results = await Promise.all(promises);
     
     const allQuestions = results.flat();
     
     const questionsRecord: Record<number, Question> = {};
     allQuestions.forEach((q, index) => {
       questionsRecord[index + 1] = q;
     });
     
     return questionsRecord;

  } catch (error) {
    console.error("Error generating variants:", error);
    throw error;
  }
};