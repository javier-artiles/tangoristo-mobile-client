/**
 * @flow
 */

import { observable, action, decorate } from 'mobx';
import { create, persist } from 'mobx-persist';
import { AsyncStorage } from 'react-native';
const _ = require('lodash');

export class GlobalPreferencesStore {
  darkModeEnabled: boolean = false;
  showFuriganaListOnTitle: boolean = false;
  textSize: number = 16;
  textMarginSize: number = 20;
  furiganaByJlptLevel: number[] = [1, 2, 3, 4, 5];
  tapToRevealFuriganaEnabled: boolean = false;
  wordHighlightByJlptLevel: number[] = [1, 2, 3, 4, 5];
  underlineHighlightEnabled: boolean = false;
  coloredTextHighlightEnabled: boolean = true;
  pronounceWordOnTap: boolean = true;
  extraDefinitionLanguages: string[] = [];
  unfoldedPreferencesScenePanels: number[] = [];
  jlptLevelColors: string[] = [
    '#e74c3c',
    '#e67e22',
    '#8e44ad',
    '#2980b9',
    '#27ae60'
  ];
  furiganaForOutOfJlptWords: boolean = true;
  defaultVoiceId: string = null;
  exportFormat: string = 'tsv';
  exportDestinationEmail: string = '';
  exportCardFront: string = 'kanji_and_kana';
  exportCardBack: string = 'english';

  setExportFormat(format: string) {
    this.exportFormat = format;
  }

  setExportDestinationEmail(email: string) {
    this.exportDestinationEmail = email;
  }

  setExportCardFront(field: string) {
    this.exportCardFront = field;
  }

  setExportCardBack(field: string) {
    this.exportCardBack = field;
  }

  setDarkModeEnabled(enabled: boolean) {
    this.darkModeEnabled = enabled;
  }

  setShowFuriganaListOnTitle(enabled: boolean) {
    this.showFuriganaListOnTitle = enabled;
  }

  setTextSize(size: number) {
    this.textSize = size;
  }

  setTextMarginSize(size: number) {
    this.textMarginSize = size;
  }

  setFuriganaByJlptLevel(level: number, enabled: boolean) {
    if (!_.inRange(level, 1, 6)) {
      console.log(`Invalid JLPT level ${level}`);
    }
    const uniqFuriganaByJlptLevel = _.uniq(this.furiganaByJlptLevel);
    this.furiganaByJlptLevel =  enabled
      ? _.concat(uniqFuriganaByJlptLevel, level)
      : uniqFuriganaByJlptLevel.filter(l => l !== level);
  }

  setTapToRevealFuriganaEnabled(enabled: boolean) {
    this.tapToRevealFuriganaEnabled = enabled;
  }

  setWordHighlightByJlptLevel(level: number, enabled: boolean) {
    if (!_.inRange(level, 1, 6)) {
      console.log(`Invalid JLPT level ${level}`);
    }
    const uniqWordHighlightByJlptLevel = _.uniq(this.wordHighlightByJlptLevel);
    this.wordHighlightByJlptLevel =  enabled
      ? _.concat(uniqWordHighlightByJlptLevel, level)
      : uniqWordHighlightByJlptLevel.filter(l => l !== level);
  }

  setUnderlineHighlightEnabled(enabled: boolean) {
    this.underlineHighlightEnabled = enabled;
  }

  setColoredTextHighlightEnabled(enabled: boolean) {
    this.coloredTextHighlightEnabled = enabled;
  }

  setPronounceWordOnTap(enabled: boolean) {
    this.pronounceWordOnTap = enabled;
  }

  setExtraDefinitionLanguageEnabled(language: string, enabled: boolean) {
    const uniqExtraDefinitionLanguages = _.uniq(this.extraDefinitionLanguages);
    this.extraDefinitionLanguages =  enabled
      ? _.concat(uniqExtraDefinitionLanguages, language)
      : uniqExtraDefinitionLanguages.filter(l => l !== language);
  }

  setUnfoldedPreferencesScenePanels(activePanelIds: number[]) {
    this.unfoldedPreferencesScenePanels = activePanelIds ? activePanelIds : [];
  }

  setFuriganaForOutOfJlptWords(enable: boolean) {
    this.furiganaForOutOfJlptWords = enable;
  }

  setDefaultVoiceId(voiceId: string) {
    this.defaultVoiceId = voiceId;
  }
}

decorate(GlobalPreferencesStore, {
  darkModeEnabled: [persist, observable],
  setDarkModeEnabled: action,
  showFuriganaListOnTitle: [persist, observable],
  setShowFuriganaListOnTitle: action,
  textSize: [persist, observable],
  setTextSize: action,
  textMarginSize: [persist, observable],
  setTextMarginSize: action,
  furiganaByJlptLevel: [persist('list'), observable],
  furiganaForOutOfJlptWords: [persist, observable],
  setFuriganaForOutOfJlptWords: action,
  setFuriganaByJlptLevel: action,
  tapToRevealFuriganaEnabled: [persist, observable],
  setTapToRevealFuriganaEnabled: action,
  wordHighlightByJlptLevel: [persist('list'), observable],
  setWordHighlightByJlptLevel: action,
  underlineHighlightEnabled: [persist, observable],
  setUnderlineHighlightEnabled: action,
  coloredTextHighlightEnabled: [persist, observable],
  setColoredTextHighlightEnabled: action,
  pronounceWordOnTap: [persist, observable],
  setPronounceWordOnTap: action,
  extraDefinitionLanguages: [persist('list'), observable],
  setExtraDefinitionLanguageEnabled: action,
  unfoldedPreferencesScenePanels: [persist('list'), observable],
  setUnfoldedPreferencesScenePanels: action,
  jlptLevelColors: [persist('list'), observable],
  defaultVoiceId: [persist, observable],
  setDefaultVoiceId: action,
  exportFormat: [persist, observable],
  exportDestinationEmail: [persist, observable],
  exportCardFront: [persist, observable],
  exportCardBack: [persist, observable],
  setExportFormat: action,
  setExportDestinationEmail: action,
  setExportCardFront: action,
  setExportCardBack: action
});

const globalPreferencesStore = new GlobalPreferencesStore();

const hydrate = create({
  storage: AsyncStorage,
  jsonify: true,
});

const fieldsToHydrate = ['darkModeEnabled', 'showFuriganaListOnTitle', 'textSize', 'textMarginSize',
 'furiganaByJlptLevel', 'tapToRevealFuriganaEnabled', 'wordHighlightByJlptLevel',
 'underlineHighlightEnabled', 'setColoredTextHighlightEnabled', 'furiganaForOutOfJlptWords',
 'pronounceWordOnTap', 'extraDefinitionLanguages', 'unfoldedPreferencesScenePanels', 'jlptLevelColors',
 'defaultVoiceId', 'exportFormat', 'exportDestinationEmail', 'exportCardFront', 'exportCardBack',
];
for (const fieldToHydrate of fieldsToHydrate) {
  hydrate(fieldToHydrate, globalPreferencesStore)
    .then(() => console.log(`hydrated ${fieldToHydrate}`))
    .catch(error => {
      console.log('Failed to hydrate', error)
    });
}

export default globalPreferencesStore;