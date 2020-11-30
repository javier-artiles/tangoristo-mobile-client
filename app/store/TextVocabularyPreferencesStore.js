/**
 * @flow
 */

import { observable, action, decorate } from 'mobx';
import { create, persist } from 'mobx-persist';
import { AsyncStorage } from 'react-native';

export class TextVocabularyPreferencesStore {
  vocabularySortBy: string = 'level';
  vocabularyIsAsc: boolean = true;
  vocabularyPosFilter: string[] = [];
  vocabularyLevelFilter: string[] = [];
  activeExtraDefinitionLanguagePanels: string[] = [];

  setActiveExtraDefinitionLanguagePanels(activePanels: string[]) {
    console.log('activePanels', activePanels);
    this.activeExtraDefinitionLanguagePanels = activePanels;
  }

  isInLevelFilter(language: string, level: string): boolean {
    const key = this.getFilterKey(language, level);
    return !this.vocabularyLevelFilter || this.vocabularyLevelFilter.length === 0 || this.vocabularyLevelFilter.includes(key);
  }

  isAnyInPosFilter(language: string, pos: string[]): boolean {
    for (let index = 0; index < pos.length; index++) {
      if (this.isInPosFilter(language, pos[index])) {
        return true;
      }
    }
    return false;
  }

  isInPosFilter(language: string, pos: string): boolean {
    const key = this.getFilterKey(language, pos);
    return !this.vocabularyPosFilter || this.vocabularyPosFilter.length === 0 || this.vocabularyPosFilter.includes(key);
  }

  getFilterKey(language: string, originalKey: string): string {
    return `${language}-${originalKey.replace('_', '-')}`;
  }

  setSortBy(sortBy: string): void {
    this.vocabularySortBy = sortBy;
  }

  setIsAsc(isAsc: boolean): void {
    this.vocabularyIsAsc = isAsc;
  }

  setPosFilter(posFilter: string[]): void {
    this.vocabularyPosFilter = posFilter;
  }

  setLevelFilter(levelFilter: string[]): void {
    this.vocabularyLevelFilter = levelFilter;
  }
}

decorate(TextVocabularyPreferencesStore, {
  vocabularySortBy: [persist, observable],
  vocabularyIsAsc: [persist, observable],
  vocabularyPosFilter: [persist('list'), observable],
  vocabularyLevelFilter: [persist('list'), observable],
  activeExtraDefinitionLanguagePanels: [persist('list'), observable],
  setActiveExtraDefinitionLanguagePanels: action,
  setSortBy: action,
  setIsAsc: action,
  setPosFilter: action,
  setLevelFilter: action,
});

const textVocabularyPreferencesStore = new TextVocabularyPreferencesStore();

const hydrate = create({
  storage: AsyncStorage,
  jsonify: true,
});

['vocabularySortBy', 'vocabularyIsAsc', 'vocabularyPosFilter', 'vocabularyLevelFilter',
  'activeExtraDefinitionLanguagePanels'].forEach(field => {
  hydrate(field, textVocabularyPreferencesStore)
    .then(() => console.log(`hydrated ${field}`));
});

export default textVocabularyPreferencesStore;