/**
 * @flow
 */

import { AsyncStorage } from 'react-native';
import { Cache } from 'react-native-cache';
import type { SearchResults } from '../service/ExternalDocumentService';

const searchResultsCache = new Cache({
  namespace: "document_search",
  policy: {
    maxEntries: 50
  },
  backend: AsyncStorage
});

export class DocumentSearchCache {

  clearAll(): void {
    return new Promise(
      (resolve, reject) => {
        searchResultsCache.clearAll(function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    );
  }

  putSearchResults(
    query: string,
    start: number,
    maxNum: number,
    sortBy: string ,
    sortAsc: boolean,
    searchResults: SearchResults
  ): void {
    const key = this.getSearchResultsKey(query, start, maxNum, sortBy, sortAsc);
    const valueString = JSON.stringify(searchResults);
    console.log('putSearchResults', key);
    searchResultsCache.setItem(key, valueString, function(err) {
      if (err) {
        console.warn(`Failed to set search results cache for key='${key}'`, err);
      }
    });
  }

  async getSearchResults(
    query: string,
    start: number,
    maxNum: number,
    sortBy: string ,
    sortAsc: boolean
  ): ?SearchResults {
    const key = this.getSearchResultsKey(query, start, maxNum, sortBy, sortAsc);
    console.log('getSearchResults', key);
    return new Promise(function(resolve, reject) {
      searchResultsCache.getItem(key, function(err, value) {
        if (err) {
          console.warn(`failed to getSearchResults for key='${key}'`, err);
          resolve(null);
        } else if (value){
          console.log('Search cache hit for key', key);
          resolve(JSON.parse(value))
        } else {
          resolve(null);
        }
      });
    });
  }

  getSearchResultsKey(
    query: string,
    start: number,
    maxNum: number,
    sortBy: string ,
    sortAsc: boolean
  ) {
    return JSON.stringify({query, start, maxNum, sortBy, sortAsc});
  }

}

const documentSearchCache = new DocumentSearchCache();
export default documentSearchCache;