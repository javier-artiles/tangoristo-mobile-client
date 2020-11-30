/**
 * @flow
 */

import type { VocabularyEntry } from './ExternalDocumentService';
import configuration from '../configuration/Configuration';
import type { HttpService } from './FetchHttpService';
import fetchHttpService from './FetchHttpService';
import React from 'react';

type Card = {
  front: string,
  back: string
}

class AnkiExportService {
  httpService: HttpService;
  apiKey: string;
  endpoint: string;

  constructor(httpService: HttpService, apiKey: string, endpoint: string) {
    this.httpService = httpService;
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  vocabularyAsCards(vocabulary: VocabularyEntry[], frontField: string, backField: string): Card[] {
    return vocabulary.map(vocabularyEntry => {
      const front = this.getValue(vocabularyEntry, frontField);
      const back = this.getValue(vocabularyEntry, backField);
      return {
        front,
        back
      };
    });
  }

  getValue(vocabularyEntry: VocabularyEntry, field: string): string {
    if (field === 'kanji') {
      return vocabularyEntry.dictionaryEntry.dictionaryForm;
    } else if (field === 'kana') {
      return vocabularyEntry.dictionaryEntry.alternateForm
        ? vocabularyEntry.dictionaryEntry.alternateForm
        : vocabularyEntry.dictionaryEntry.dictionaryForm;
    } else if (field === 'kanji_and_kana') {
      return vocabularyEntry.dictionaryEntry.alternateForm
        ? `${vocabularyEntry.dictionaryEntry.dictionaryForm}【${vocabularyEntry.dictionaryEntry.alternateForm}】`
        : vocabularyEntry.dictionaryEntry.dictionaryForm;
    } else if (field === 'english') {
      return vocabularyEntry.dictionaryEntry.definitions['en'].join('; ');
    } else {
      console.warn(`Unsupported card export field '${field}'`);
      return '';
    }
  }

  export(
    vocabulary: VocabularyEntry[],
    frontField: string,
    backField: string,
    title: string,
    url: string,
    email: string
  ): Promise {
    const cards = this.vocabularyAsCards(vocabulary, frontField, backField);
    const body = JSON.stringify(
      {
        title,
        url,
        cards,
        email
      }
    );
    return this.httpService.post(this.endpoint, this.apiKey, body)
      .then(result => {
        console.log(result);
        if (!result.ok) {
          throw new Error(`Failed with error code ${result.status}`);
        }
      });
  }
}


const ankiExportService = new AnkiExportService(
  fetchHttpService,
  configuration.apiKey,
  configuration.ankiExportEndpoint
);

export default ankiExportService;