// IndexedDB wrapper for photo storage
const DB_NAME = "wanderlust-photos";
const DB_VERSION = 1;
const STORE_NAME = "photos";

interface PhotoBlob {
  id: number;
  blob: Blob;
  tripId: string;
  photoId: string;
}

class PhotoStorage {
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
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          objectStore.createIndex("tripId", "tripId", { unique: false });
          objectStore.createIndex("photoId", "photoId", { unique: true });
        }
      };
    });
  }

  async savePhoto(
    blob: Blob,
    tripId: string,
    photoId: string
  ): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add({ blob, tripId, photoId });

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getPhoto(photoId: string): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("photoId");
      const request = index.get(photoId);

      request.onsuccess = () => {
        const result = request.result as PhotoBlob | undefined;
        resolve(result?.blob || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deletePhoto(photoId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("photoId");
      const request = index.getKey(photoId);

      request.onsuccess = () => {
        const key = request.result;
        if (key) {
          const deleteRequest = store.delete(key);
          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPhotos(tripId: string): Promise<PhotoBlob[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("tripId");
      const request = index.getAll(tripId);

      request.onsuccess = () => resolve(request.result as PhotoBlob[]);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAllPhotos(tripId: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("tripId");
      const request = index.getAllKeys(tripId);

      request.onsuccess = () => {
        const keys = request.result;
        keys.forEach((key) => store.delete(key));
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const photoStorage = new PhotoStorage();
