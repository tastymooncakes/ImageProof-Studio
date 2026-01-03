// src/lib/imageStorage.ts

const DB_NAME = "ImageProofDB";
const DB_VERSION = 2; // Increment version for new store
const IMAGE_STORE = "images";
const EVIDENCE_STORE = "evidence"; // NEW

interface StoredImage {
  id: string;
  file: Blob;
  name: string;
  uploadedAt: string;
}

class ImageStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create images store if it doesn't exist
        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          db.createObjectStore(IMAGE_STORE, { keyPath: "id" });
        }

        // Create evidence store if it doesn't exist
        if (!db.objectStoreNames.contains(EVIDENCE_STORE)) {
          db.createObjectStore(EVIDENCE_STORE, { keyPath: "id" });
        }
      };
    });
  }

  async saveImage(id: string, file: File): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_STORE], "readwrite");
      const store = transaction.objectStore(IMAGE_STORE);

      const imageData: StoredImage = {
        id,
        file,
        name: file.name,
        uploadedAt: new Date().toISOString(),
      };

      const request = store.put(imageData);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getImage(id: string): Promise<string | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_STORE], "readonly");
      const store = transaction.objectStore(IMAGE_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as StoredImage | undefined;
        if (result) {
          const url = URL.createObjectURL(result.file);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_STORE], "readwrite");
      const store = transaction.objectStore(IMAGE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllImages(): Promise<
    Array<{ id: string; name: string; uploadedAt: string }>
  > {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([IMAGE_STORE], "readonly");
      const store = transaction.objectStore(IMAGE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as StoredImage[];
        resolve(
          results.map((r) => ({
            id: r.id,
            name: r.name,
            uploadedAt: r.uploadedAt,
          }))
        );
      };

      request.onerror = () => reject(request.error);
    });
  }

  // NEW: Evidence methods
  async saveEvidence(id: string, file: File): Promise<string> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], "readwrite");
      const store = transaction.objectStore(EVIDENCE_STORE);

      const evidenceData: StoredImage = {
        id,
        file,
        name: file.name,
        uploadedAt: new Date().toISOString(),
      };

      const request = store.put(evidenceData);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getEvidence(id: string): Promise<string | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], "readonly");
      const store = transaction.objectStore(EVIDENCE_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as StoredImage | undefined;
        if (result) {
          const url = URL.createObjectURL(result.file);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getEvidenceMetadata(
    id: string
  ): Promise<{ id: string; name: string; uploadedAt: string } | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], "readonly");
      const store = transaction.objectStore(EVIDENCE_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as StoredImage | undefined;
        if (result) {
          resolve({
            id: result.id,
            name: result.name,
            uploadedAt: result.uploadedAt,
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async deleteEvidence(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([EVIDENCE_STORE], "readwrite");
      const store = transaction.objectStore(EVIDENCE_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const imageStorage = new ImageStorage();
