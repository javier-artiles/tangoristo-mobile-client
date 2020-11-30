import mockSearchResponse from '../../__mocks__/mock_search_response.js';
import mockGetDocumentResponse from '../../__mocks__/mock_get_document_response.js';
import configuration from '../configuration/Configuration';


class MockHttpService {
  get(url: string, apiKey: string): Promise {
    return new Promise(function(resolve, reject) {
      if (url.startsWith(configuration.searchDocumentsEndpoint)) {
        resolve(mockSearchResponse);
      } else if (url.startsWith(configuration.getDocumentEndpoint)) {
        resolve(mockGetDocumentResponse);
      } else {
        reject(`MockHttpServer couldn't handle URL = ${url}`)
      }
    });
  }
}

export default new MockHttpService();