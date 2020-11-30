import { Alert } from 'react-native';

class UrlTextContentService {

  async getTextContent(url: string) {
    try {
      return await this.getTextContentUsingBoilerPipe(url);
    } catch(error) {
      console.warn('Failed to fetch BoilerPipe result, falling back to simple html scraping', error);
      return await this.getTextContentUsingHtmlScraping(url);
    }
  }

  getTextContentUsingBoilerPipe(url: string) {
    const boilerpipeApiUrl = `https://boilerpipe-web.appspot.com/extract?url=${encodeURIComponent(url)}&extractor=ArticleExtractor&output=json&extractImages=false`;
    console.log(boilerpipeApiUrl);
    return fetch(boilerpipeApiUrl)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to access BoilerPipe server');
        }
      })
      .then(json => {
        console.log(json);
        if (json.status && json.status === 'success') {
          console.log('BoilerPipe API result', json);
          return json.response.content;
        } else {
          throw new Error(`BoilerPipe returned error message ${json.error}`);
        }
      });
  }

  getTextContentUsingHtmlScraping(url: string) {
    console.log('getTextContentUsingHtmlScraping', url);
    return fetch(url)
      .then(response => {
        console.log(response);
        if (!response.ok) {
          let message = JSON.parse(response._bodyInit).message;
          Alert.alert('Oops...', `Couldn't reach the URL '${this.state.text}', ${message}`);
        } else {
          return response.text();
        }
      })

      .then(html => {
        return html.replace(/(<([^>]+)>)/ig, '').replace(/\s\s/g, ' ');
      })
      .catch(error => {
        Alert.alert('Oops...', 'Something failed while trying to retrieve the URL text: ' + JSON.stringify(error));
      });
  }
}

const urlTextContentService = new UrlTextContentService();
export default urlTextContentService;