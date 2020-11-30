/**
 * @flow
 */

import { observable, action, decorate } from 'mobx';
import type { Hit, SearchResults } from '../service/ExternalDocumentService';
import { create, persist } from 'mobx-persist';
import { AsyncStorage } from 'react-native';
import documentSearchCache from './DocumentSearchCache';
import externalDocumentService from '../service/ExternalDocumentService';

export type Query = {
  text: string,
  siteName: string,
  category: string
}

export class DocumentFeedStore {
  MAX_NUM_RECENT_QUERIES = 10;

  totalNumResults: number = 0;
  hits: Hit[] = [];
  pageSize: number = 20;
  queryText: string = '';
  querySiteName: string = '';
  queryTitle: string = '';
  queryCategory: string = '';
  start: number = 0;
  sortBy: string = 'publication';
  sortAsc: boolean = false;
  fetchingDocuments: boolean = false;
  refreshing: boolean = false;
  error: ?Error = null;
  recentQueries: Query[] = [];

  async search(): void {
    const query = this.getQueryString(this.queryText, this.querySiteName, this.queryCategory);
    // To make the list responsive, show any cached results while fetching takes place in the background
    this.fetchingDocuments = true;
    if (this.start === 0) {
      const searchResults = await documentSearchCache.getSearchResults(query, this.start, this.pageSize, this.sortBy, this.sortAsc);
      if (searchResults) {
        console.log('Using cached search results', searchResults);
        this.totalNumResults = searchResults.total;
        this.hits = searchResults.hits;
      }
    }

    return externalDocumentService.search(query, this.start, this.pageSize, this.sortBy, this.sortAsc)
      .then((searchResults: SearchResults) => {
        console.log('searchResults', this.start, this.pageSize, searchResults);
        const totalNumResults = searchResults.total;
        const hitIds = new Set(this.hits.map(h => h.id));
        const hits = (this.start === 0)
          ? searchResults.hits
          : this.hits.concat(searchResults.hits.filter(h => !hitIds.has(h.id)));

        this.totalNumResults = totalNumResults;
        this.hits = hits;
        this.fetchingDocuments = false;
        this.error = null;
        this.refreshing = false;
        if (this.start === 0) {
          documentSearchCache.putSearchResults(query, this.start, this.pageSize, this.sortBy, this.sortAsc, searchResults);
          console.log('queryText', this.queryText);
          console.log('querySiteName', this.querySiteName);
          console.log('queryCategory', this.queryCategory);
          const currentQuery = { text: this.queryText, siteName: this.querySiteName, category: this.queryCategory };
          console.log('currentQuery', currentQuery, totalNumResults, this.recentQueries);
          if (totalNumResults > 0
            && currentQuery
            && currentQuery.text
            && currentQuery.text.length > 0
            && !this.recentQueries.map(q => JSON.stringify(q)).includes(JSON.stringify(currentQuery))
          ) {
            this.recentQueries.unshift(currentQuery);
            if (this.recentQueries.length > this.MAX_NUM_RECENT_QUERIES) {
              this.recentQueries = this.recentQueries.slice(0, this.MAX_NUM_RECENT_QUERIES);
            }
          }
        }
      })
      .catch((error) => {
        console.log('Failed to fetch documents ', error);
        this.error = error;
        this.fetchingDocuments = false;
        this.refreshing = false;
      });
  }

  getQueryString(text: string, siteName: string, category: string): string {
    const queryList = [];
    if (text) {
      for (const textChunk of text.split(/[\s,]/)) {
        queryList.push(`text:(${textChunk})`);
      }
    }
    if (siteName && siteName.length > 0) {
      queryList.push(`site_name:("${siteName}")`);
    }
    if (category && category.length > 0) {
      queryList.push(`category:("${category}")`);
    }
    return queryList.length > 0 ? queryList.join('') : '*:*';
  }

  refresh() {
    this.start = 0;
    this.refreshing = true;
    this.search();
  }

  isReady(): boolean {
    return !this.fetchingDocuments && this.start + this.pageSize < this.totalNumResults;
  }

}

decorate(DocumentFeedStore, {
  queryText: [persist, observable],
  querySiteName: [persist, observable],
  queryTitle: [persist, observable],
  queryCategory: [persist, observable],
  start: [observable],
  sortBy: [persist, observable],
  sortAsc: [persist, observable],
  recentQueries: [persist('list'), observable],
  totalNumResults: observable,
  hits: observable,
  fetchingDocuments: observable,
  refreshing: observable,
  search: action,
  refresh: action
});

const documentFeedStore = new DocumentFeedStore();

const hydrate = create({
  storage: AsyncStorage,
  jsonify: true,
});

['queryText', 'querySiteName', 'queryCategory', 'sortBy', 'sortAsc', 'recentQueries'].forEach(field => {
  hydrate(field, documentFeedStore)
    .then(() => console.log(`hydrated ${field}`));
});

export default documentFeedStore;