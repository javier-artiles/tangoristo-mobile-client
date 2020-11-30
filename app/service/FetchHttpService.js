export type HttpService = {
  get: (url: string, apiKey: string) => Promise
}

class FetchHttpService {
  get(url: string, apiKey: string): Promise {
    const httpRequest = {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
      }
    };
    console.log('GET', url);
    return fetch(url, httpRequest);
  }

  post(url: string, apiKey: string, body: string): Promise {
    const httpRequest = {
      method: 'POST',
      body,
      headers: {
        'x-api-key': apiKey
      }
    };
    console.log('POST', url);
    return fetch(url, httpRequest);
  }
}

export default new FetchHttpService();