/**
 * @flow
 */

import Realm from 'realm';
import type { DictionaryEntry } from '../service/ExternalDocumentService';

const SavedDictionaryEntrySchema = {
  name: 'SavedDictionaryEntry',
  primaryKey: 'id',
  properties: {
    id: 'string',
    saveDate: 'date',
    language: 'string',
    partOfSpeech: 'string[]',
    dictionaryForm: 'string',
    alternateForm: 'string',
    proficiencyLevel: 'int?',
    dictionaryEntryJson: 'string'
  }
};

export class SavedDictionaryEntry {
  id: string;
  saveDate: Date;
  language: string;
  dictionaryEntry: DictionaryEntry;

  constructor (id: string, saveDate: Date, language: string, dictionaryEntry: DictionaryEntry) {
    this.id = id;
    this.saveDate = saveDate;
    this.language = language;
    this.dictionaryEntry = dictionaryEntry;
  }
}

export class SavedDictionaryEntryStore {
  realm: ?Realm = null;

  constructor() {
    this.realm = new Realm({
      path: 'saved_vocabulary.realm',
      schema: [SavedDictionaryEntrySchema],
      deleteRealmIfMigrationNeeded: true
    });
  }

  remove(dictionaryEntryId: number, language: string): void {
    const realmObject = this.getRealmObject(dictionaryEntryId, language);
    this.realm.write(() => {
      this.realm.delete(realmObject);
    });
  }


  put(dictionaryEntry: DictionaryEntry, language: string): void {
    this.realm.write(() => {
      const id = this.getKey(dictionaryEntry.entSeq, language);
      const saveDate = new Date();
      const partOfSpeech = dictionaryEntry.partOfSpeech;
      let { dictionaryForm, alternateForm } = dictionaryEntry;
      alternateForm = !!alternateForm ? alternateForm: '';
      const proficiencyLevel = dictionaryEntry.officialProficiencyLevel !== 'UNKNOWN'
        ? Number.parseInt(dictionaryEntry.officialProficiencyLevel.replace('JLPT_N', ''))
        : null;
      const dictionaryEntryJson = JSON.stringify(dictionaryEntry);
      const savedDictionaryEntry = {
        id,
        language,
        saveDate,
        partOfSpeech,
        alternateForm,
        dictionaryForm,
        proficiencyLevel,
        dictionaryEntryJson
      };
      this.realm.create('SavedDictionaryEntry',savedDictionaryEntry);
    });
  }

  getKey(dictionaryEntryId: number, language: string) {
    return `${dictionaryEntryId}#${language}`;
  }

  has(dictionaryEntryId: number, language: string): boolean {
    const realmObject = this.getRealmObject(dictionaryEntryId, language);
    return !!realmObject;
  }

  getRealmObject(dictionaryEntryId: number, language: string) {
    const key = this.getKey(dictionaryEntryId, language);
    return this.realm.objectForPrimaryKey('SavedDictionaryEntry', key);
  }

  get(dictionaryEntryId: number, language: string): SavedDictionaryEntry {
    return this.asSavedDictionaryEntry(this.getRealmObject(dictionaryEntryId, language));
  }

  find(): SavedDictionaryEntry[] {
    // TODO add filters
    return this.realm.objects('SavedDictionaryEntry')
      .map(realmSavedDictionaryEntry=> this.asSavedDictionaryEntry(realmSavedDictionaryEntry));
  }

  asSavedDictionaryEntry(realmSavedDictionaryEntry): SavedDictionaryEntry {
    const {id, savedDate, language, dictionaryEntryJson} = realmSavedDictionaryEntry;
    const dictionaryEntry = JSON.parse(dictionaryEntryJson);
    return new SavedDictionaryEntry(id, savedDate, language, dictionaryEntry);
  }
}

const savedDictionaryEntryStore = new SavedDictionaryEntryStore;
export default savedDictionaryEntryStore;