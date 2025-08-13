// Embedding utilities and vector operations
import { OpenAIProvider } from './providers';
import type { EmbeddingResult } from './types';

export class EmbeddingManager {
  private openai: OpenAIProvider;

  constructor(apiKey?: string) {
    this.openai = new OpenAIProvider(apiKey);
  }

  async createEmbedding(text: string, metadata?: Record<string, any>): Promise<EmbeddingResult> {
    const result = await this.openai.createEmbedding(text);
    
    return {
      embedding: result.embedding!,
      text,
      metadata,
    };
  }

  async createEmbeddings(texts: string[], metadata?: Record<string, any>[]): Promise<EmbeddingResult[]> {
    const result = await this.openai.createEmbeddings(texts);
    
    return result.embeddings.map((embedding, index) => ({
      embedding,
      text: texts[index],
      metadata: metadata?.[index],
    }));
  }

  // Cosine similarity between two embeddings
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embedding dimensions must match');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Find most similar embeddings
  findSimilar(
    queryEmbedding: number[],
    embeddings: EmbeddingResult[],
    topK = 5,
    threshold = 0.7
  ): Array<EmbeddingResult & { similarity: number }> {
    const similarities = embeddings.map(item => ({
      ...item,
      similarity: this.cosineSimilarity(queryEmbedding, item.embedding),
    }));

    return similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  // Chunk text for embedding (respects token limits)
  chunkText(text: string, maxChunkSize = 1000): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const potential = currentChunk + sentence + '. ';
      
      if (potential.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence + '. ';
      } else {
        currentChunk = potential;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  // Create embeddings for chunked content
  async embedContent(content: string, metadata?: Record<string, any>): Promise<EmbeddingResult[]> {
    const chunks = this.chunkText(content);
    const embeddings = await this.createEmbeddings(chunks);
    
    return embeddings.map((embedding, index) => ({
      ...embedding,
      metadata: {
        ...metadata,
        chunkIndex: index,
        totalChunks: chunks.length,
      },
    }));
  }
}

// Utility functions for vector operations
export const vectorUtils = {
  // Normalize a vector to unit length
  normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  },

  // Calculate Euclidean distance
  euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vector dimensions must match');
    }
    
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
  },

  // Calculate dot product
  dotProduct(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vector dimensions must match');
    }
    
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  },

  // Average multiple vectors
  average(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];
    
    const dimension = vectors[0].length;
    const sum = new Array(dimension).fill(0);
    
    for (const vector of vectors) {
      if (vector.length !== dimension) {
        throw new Error('All vectors must have same dimension');
      }
      
      for (let i = 0; i < dimension; i++) {
        sum[i] += vector[i];
      }
    }
    
    return sum.map(val => val / vectors.length);
  },
};