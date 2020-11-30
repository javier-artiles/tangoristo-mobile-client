/**
 * @flow
 */

import type {DictionaryEntry, VocabularyEntry} from './ExternalDocumentService';
import type { HttpService } from './FetchHttpService';
import fetchHttpService from './FetchHttpService';
import configuration from '../configuration/Configuration';

class TsvExportService {
  httpService: HttpService;
  apiKey: string;
  endpoint: string;

  constructor(httpService: HttpService, apiKey: string, endpoint: string) {
    this.httpService = httpService;
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  export(vocabulary: VocabularyEntry[], title: string, url: string, email: string): string {
    let vocabularyHeader =
      ['dictionaryForm', 'alternateForm', 'other occurrences in text', 'pos', 'proficiencyLevel', 'English'].join('\t');
    let vocabularyStr =
      [ ...new Set(vocabulary.map(vocabularyEntry => this.asExportLine(vocabularyEntry)))].join("\n");
    const tsv = `${vocabularyHeader}\n${vocabularyStr}`;
    const body = JSON.stringify({title, url, tsv, email});
    return this.httpService.post(this.endpoint, this.apiKey, body)
      .then(result => {
        console.log(result);
        if (!result.ok) {
          throw new Error(`Failed with error code ${result.status}`);
        }
      });
  }

  exportDictionaryEntry(dictionaryEntry: DictionaryEntry) {
    let dictionaryForm = dictionaryEntry.dictionaryForm;
    let alternateForm = dictionaryEntry.alternateForm ? dictionaryEntry.alternateForm : '-';
    let pos = dictionaryEntry.partOfSpeech.filter(p => p !== null).join(", ");
    let proficiencyLevel = dictionaryEntry.officialProficiencyLevel ? dictionaryEntry.officialProficiencyLevel : '-';
    if (proficiencyLevel === 'UNKNOWN') {
      proficiencyLevel = '-';
    }
    let occurrences = '-';
    let english = dictionaryEntry.definitions.en ? dictionaryEntry.definitions.en.join('; ') : '';
    return [dictionaryForm, alternateForm, occurrences, pos, proficiencyLevel, english].join("\t");
  }

  asExportLine(vocabularyEntry: VocabularyEntry) {
    let dictionaryEntry = vocabularyEntry.dictionaryEntry;
    let dictionaryForm = dictionaryEntry.dictionaryForm;
    let alternateForm = dictionaryEntry.alternateForm ? dictionaryEntry.alternateForm : '-';
    let pos = dictionaryEntry.partOfSpeech.filter(p => p !== null).join(", ");
    let proficiencyLevel = dictionaryEntry.officialProficiencyLevel ? dictionaryEntry.officialProficiencyLevel : '-';
    if (proficiencyLevel === 'UNKNOWN') {
      proficiencyLevel = '-';
    }
    let occurrences = '-';
    if (vocabularyEntry.tokenSequenceOccurrences) {
      occurrences = vocabularyEntry.tokenSequenceOccurrences
        .map(occ => occ.surfaceForm)
        .filter(surfaceForm => ![dictionaryForm, alternateForm].includes(surfaceForm))
        .join(", ");
    }
    let english = dictionaryEntry.definitions.en ? dictionaryEntry.definitions.en.join('; ') : '';
    return [dictionaryForm, alternateForm, occurrences, pos, proficiencyLevel, english].join("\t");
  }
}

const tsvExportService = new TsvExportService(
  fetchHttpService,
  configuration.apiKey,
  configuration.tsvExportEndpoint
);

export default tsvExportService;