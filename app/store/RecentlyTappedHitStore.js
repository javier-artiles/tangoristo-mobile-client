/**
 * @flow
 */

import { AsyncStorage } from 'react-native';
import type { Hit } from '../service/ExternalDocumentService';
import { action, decorate, observable } from 'mobx';
import { create, persist } from 'mobx-persist';


export class RecentlyTappedHitStore {
  maxSize: number = 10;
  hitQueue: Hit[] = [];

  putHit(hit: Hit) {
    if (this.hitQueue.some(h => h.id === hit.id)) {
      return;
    }
    this.hitQueue.unshift(hit);
    if (this.hitQueue.length > this.maxSize) {
      this.hitQueue.pop();
    }
  }
}


decorate(RecentlyTappedHitStore, {
  maxSize: [persist, observable],
  hitQueue: [persist('list'), observable],
  putHit: action
});

const recentlyTappedHitStore = new RecentlyTappedHitStore();

const hydrate = create({
  storage: AsyncStorage,
  jsonify: true,
});


['maxSize', 'hitQueue'].forEach(field => {
  hydrate(field, recentlyTappedHitStore)
    .then(() => console.log(`hydrated ${field}`));
});

export default recentlyTappedHitStore;