/**
 * @flow
 */

import { AsyncStorage } from 'react-native';
import type { DictionaryEntry } from '../service/ExternalDocumentService';
import { action, decorate, observable } from 'mobx';
import { create, persist } from 'mobx-persist';


export class RecentlyTappedWordStore {
  maxSize: number = 100;
  dictionaryEntryQueue: DictionaryEntry[] = [];

  putDictionaryEntry(dictionaryEntry: DictionaryEntry) {
    if (this.dictionaryEntryQueue.some(d => d.entSeq === dictionaryEntry.entSeq)) {
      return;
    }
    this.dictionaryEntryQueue.unshift(dictionaryEntry);
    if (this.dictionaryEntryQueue.length > this.maxSize) {
      this.dictionaryEntryQueue.pop();
    }
  }
}

decorate(RecentlyTappedWordStore, {
  maxSize: [persist, observable],
  dictionaryEntryQueue: [persist('list'), observable],
  putDictionaryEntry: action
});

const recentlyTappedWordStore = new RecentlyTappedWordStore();

const hydrate = create({
  storage: AsyncStorage,
  jsonify: true,
});

['maxSize', 'dictionaryEntryQueue'].forEach(field => {
  hydrate(field, recentlyTappedWordStore)
    .then(() => console.log(`hydrated ${field}`));
});

export default recentlyTappedWordStore;