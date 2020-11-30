/**
 * @flow
 */

import { AsyncStorage } from 'react-native';
import { Cache } from 'react-native-cache';

const pako = require('pako');

const cache = new Cache({
  namespace: "document",
  policy: {
    maxEntries: 50
  },
  backend: AsyncStorage
});

export class DocumentCache {

  clearAll(): number {
    return new Promise(
      (resolve, reject) => {
        cache.getAll(function(err, entries) {
          if (err) {
            reject(err);
          }
          const cacheKeys = Object.keys(entries);
          cacheKeys.forEach(key => {
            cache.removeItem(key, function(err) {
              if (err) {
                console.warn(err);
              }
            });
          });
          resolve(cacheKeys.length);
        });
      }
    );
  }

  putDocument(documentKey: string, document: Document): void {
    const valueString = pako.deflate(JSON.stringify(document), { to: 'string' });
    console.log('putSearchResults', documentKey);
    cache.setItem(documentKey, valueString, function(err) {
      if (err) {
        console.warn(`Failed to set search results cache for key='${documentKey}'`, err);
      }
    });
  }

  async getDocument(
    documentKey: string
  ): ?Document {
    console.log('getDocument', documentKey);
    return new Promise(function(resolve, reject) {
      cache.getItem(documentKey, function(err, value) {
        if (err) {
          console.warn(`failed to getDocument for key='${key}'`, err);
          resolve(null);
        } else if (value){
          console.log('Document cache hit for key', documentKey);
          resolve(JSON.parse(pako.inflate(value, { to: 'string' })));
        } else {
          resolve(null);
        }
      });
    });
  }
}

const documentCache = new DocumentCache();
export default documentCache;