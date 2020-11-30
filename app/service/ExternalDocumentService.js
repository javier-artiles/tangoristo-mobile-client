/**
 * @flow
 */

import configuration, { environment } from '../configuration/Configuration';
import mockHttpService from './MockHttpService';
import fetchHttpService from './FetchHttpService';
import documentCache from '../store/DocumentCache';
import type { HttpService } from './FetchHttpService';
const base64js = require('base64-js');
const pako = require('pako');


export type Structure = {
  url: string,
  text: string,
  title: string,
  audio_stream_url: string,
  video_stream_url: string,
  leading_image_url: string,
  publication_timestamp: number
}

export type Analysis = {
  structureKey: string,
  titleAnalysis: TextAnalysis,
  bodyAnalysis: TextAnalysis
}

export type TextAnalysis = {
  language: string,
  vocabularyLevel: {}, // TODO
  linkedText: LinkedText[],
  vocabulary: VocabularyEntry[],
}

export type LinkedText = {
  vocabularyIndex: number,
  sequenceIndex: number,
  surfaceList: string[],
  readingList: string[]
}

export type VocabularyEntry = {
  dictionaryEntry: DictionaryEntry,
  firstOccurrenceOffset: number,
  reading: string,
  tokenSequenceOccurrences: TokenSequence[]
}

export type DictionaryEntry = {
  alternateForm: string,
  commonWord: boolean,
  definitions: Definition[],
  dictionaryForm: string,
  entSeq: number,
  keleList: Kele[],
  officialProficiencyLevel: string,
  partOfSpeech: string[],
  releList: Rele[],
  senseList: Sense[],
  transList: Trans[],
}

export type Definition = {
  en: string[]
}

export type Kele = {
  keInf: string[],
  kePri: string[],
  keb: string
}

export type Rele = {
  reInf: string[],
  reNokanji: boolean,
  rePri: string[],
  reRestr: string[],
  reb: string
}

export type Sense = {
  ant: string[],
  dial: string[],
  field: string[],
  gloss: Gloss[],
  lsource: string[],
  misc: string[],
  pos: string[],
  sinf: string[],
  stagk: string[],
  stagr: string[],
  xref: string[]
}

export type Gloss = {
  lang: string,
  text: string
}

export type Trans = {

}

export type TokenSequence = {
  baseForm: string,
  firstOccurrenceOffset: number,
  inflected: boolean,
  inflectionAnalysisResult: InflectionAnalysis,
  surfaceForm: string,
  surfaceReading: string,
  tokenList: Token[]
}

export type InflectionAnalysis = {
  inflectionBase: string,
  inflectionForm: string,
  inflectionName: string
}

export type Token = {
  alignedReadingsToForms: AlignedReadingToForm[],
  baseForm: string,
  inflected: boolean,
  partOfSpeech: string,
  startOffset: number,
  surfaceForm: string,
  surfaceReading: string
}

export type AlignedReadingToForm = {
  reading: string,
  surfaceForm: string
}

export type Document = {
  site_name: string,
  publication_date: string,
  article_id: string,
  structure: Structure,
  analysis: Analysis
}

export type SearchResults = {
  total: number,
  hits: Hit[]
}

export type TitleToken = {
  surface_list: string[],
  reading_list: string[],
  official_proficiency_level: ?string
}

export type Hit = {
  id: string,
  language: string,
  publication: Date,
  siteName: string,
  thumbnailUrl: string,
  title: string,
  url: string,
  category: string,
  vocabularyLevelScore: number,
  vocabularyLevelToFrequency: {},
  titleTokens: TitleToken[]
}

class ExternalDocumentService {
  httpService: HttpService;
  apiKey: string;
  searchDocumentsEndpoint: string;
  getDocumentEndpoint: string;
  getTextAnalysisEndpoint: string;

  constructor(
    httpService: HttpService,
    apiKey: string,
    searchDocumentsEndpoint: string,
    getDocumentEndpoint: string,
    getTextAnalysisEndpoint: string
  ) {
    this.httpService = httpService;
    this.apiKey = apiKey;
    this.searchDocumentsEndpoint = searchDocumentsEndpoint;
    this.getDocumentEndpoint = getDocumentEndpoint;
    this.getTextAnalysisEndpoint = getTextAnalysisEndpoint;
  }

  async getDocument(articleKey: string, useCache: boolean = true): Document {
    console.log('getDocument', articleKey, useCache);
    if (useCache) {
      const cachedDocument = await documentCache.getDocument(articleKey);
      if (cachedDocument) {
        console.log('Using cached document');
        return new Promise(function(resolve) { resolve(cachedDocument) });
      }
    }

    const params = [
      `article_key=${encodeURIComponent(articleKey)}`,
    ].join('&');
    const url = `${this.getDocumentEndpoint}?${params}`;
    console.log('getDocument', url);
    return this.httpService.get(url, this.apiKey)
      .then((response) => response.text())
      .then((compressedBase64Document) => {
        const byteArray = base64js.toByteArray(compressedBase64Document);
        const documentString = pako.ungzip(byteArray, {to: 'string'});
        const document = JSON.parse(documentString);
        if (useCache) {
          documentCache.putDocument(articleKey, document);
        }
        return document;
      });
  }

  async analyzeText(text: string, language: string = 'ja'): TextAnalysis {
    console.log('analyzeText', text, language);
    const params = [
      `language=${encodeURIComponent(language)}`,
    ].join('&');
    const url = `${this.getTextAnalysisEndpoint}?${params}`;
    const response = await this.httpService.post(url, this.apiKey, text);
    // TODO handle non 200 codes
    console.log(response);
    const compressedBase64Result = await response.text();
    console.log(compressedBase64Result);
    const byteArray = base64js.toByteArray(compressedBase64Result);
    const resultString = pako.ungzip(byteArray, {to: 'string'});
    const result = JSON.parse(resultString);
    console.log(result);
    return result;
  }

  search(
    query: string,
    start: number = 0,
    maxNum: number = 20,
    sortBy: string = 'publication',
    sortAsc: boolean = false
  ): Promise<any> {
    const params = [
      `query=${encodeURIComponent(query)}`,
      `start=${encodeURIComponent(start)}`,
      `maxNum=${encodeURIComponent(maxNum)}`,
      `sortBy=${encodeURIComponent(sortBy)}`,
      `sortAsc=${encodeURIComponent(sortAsc)}`
    ].join('&');
    const url = `${this.searchDocumentsEndpoint}?${params}`;
    console.log('search', url);
    return this.httpService.get(url, this.apiKey)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw Error('The search failed');
        }
      });
  }
}

const httpService = environment === 'local'
  ? mockHttpService
  : fetchHttpService;

export default new ExternalDocumentService(
  httpService,
  configuration.apiKey,
  configuration.searchDocumentsEndpoint,
  configuration.getDocumentEndpoint,
  configuration.getTextAnalysisEndpoint
);