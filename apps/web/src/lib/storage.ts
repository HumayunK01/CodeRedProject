// OutbreakLens Local Storage Utilities

import { StoredResult } from './types';

const STORAGE_KEY = 'outbreaklens-results';
const MAX_STORED_RESULTS = 50;

export class StorageManager {
  static saveResult(result: StoredResult): void {
    try {
      const existing = this.getAllResults();
      const updated = [result, ...existing].slice(0, MAX_STORED_RESULTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save result to storage:', error);
    }
  }

  static getAllResults(): StoredResult[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load results from storage:', error);
      return [];
    }
  }

  static getResultById(id: string): StoredResult | null {
    const results = this.getAllResults();
    return results.find(r => r.id === id) || null;
  }

  static deleteResult(id: string): void {
    try {
      const results = this.getAllResults();
      const filtered = results.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.warn('Failed to delete result from storage:', error);
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }

  static exportToCsv(): string {
    const results = this.getAllResults();
    
    if (results.length === 0) {
      return 'No data to export';
    }

    const headers = ['ID', 'Type', 'Timestamp', 'Input', 'Result'];
    const rows = results.map(result => [
      result.id,
      result.type,
      result.timestamp,
      JSON.stringify(result.input),
      JSON.stringify(result.result)
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}