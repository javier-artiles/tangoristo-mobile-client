/**
 * @flow
 */

import Realm from 'realm';
import type { Hit } from '../service/ExternalDocumentService';

const SavedDocumentSchema = {
  name: 'SavedDocument',
  primaryKey: 'id',
  properties: {
    id: 'string',
    saveDate: 'date',
    language: 'string',
    publicationDate: 'date',
    vocabularyLevelScore: 'double',
    searchHitJson: 'string',
    documentJson: 'string'
  }
};

export class SavedDocumentStore {
  realm: ?Realm = null;

  constructor() {
    this.realm = new Realm({
      path: 'saved_document.realm',
      schema: [SavedDocumentSchema],
      deleteRealmIfMigrationNeeded: true
    });
  }

  remove(documentId: string, language: string): void {
    console.log('remove', documentId, language);
    const realmObject = this.getRealmObject(documentId, language);
    this.realm.write(() => {
      this.realm.delete(realmObject);
    });
  }

  getRealmObject(documentId: string, language: string) {
    const key = this.getKey(documentId, language);
    return this.realm.objectForPrimaryKey('SavedDocument', key);
  }

  getKey(documentId: string, language: string) {
    return `${language}#${documentId}`;
  }

  put(documentHit: Hit, document: Document, language: string): void {
    console.log('put', documentHit, document, language);
    this.realm.write(() => {
      const id = this.getKey(documentHit.id, language);
      const saveDate = new Date();
      const publicationDate = documentHit.publication;
      const vocabularyLevelScore = documentHit.vocabularyLevelScore;
      const searchHitJson = JSON.stringify(documentHit);
      const documentJson = JSON.stringify(document);
      console.log('compressed', searchHitJson);
      this.realm.create('SavedDocument',
        { id, saveDate, language, publicationDate, vocabularyLevelScore, searchHitJson, documentJson });
    });
  }

  has(documentId: string, language: string): boolean {
    const realmObject = this.getRealmObject(documentId, language);
    return !!realmObject;
  }

  getAsDocument(documentId: string, language: string): Document {
    const realmObject = this.getRealmObject(documentId, language);
    return this.asDocument(realmObject);
  }

  findAsHits(): Hit[] {
    // TODO add filters
    return this.realm.objects('SavedDocument')
      .map(realmDocument => this.asHit(realmDocument));
  }

  asHit(realmSavedDocument): Hit {
    const { searchHitJson } = realmSavedDocument;
    const searchHit = JSON.parse(searchHitJson);
    console.log('searchHit', searchHit);
    return searchHit;
  }

  asDocument(realmSavedDocument): Document {
    const { documentJson } = realmSavedDocument;
    const document = JSON.parse(documentJson);
    console.log('document', document);
    return document;
  }
}

const savedDocumentStore = new SavedDocumentStore;
export default savedDocumentStore;