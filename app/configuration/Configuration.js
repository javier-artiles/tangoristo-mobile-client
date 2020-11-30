/**
 * @flow
 */

export type Configuration = {
  apiKey: string,
  searchDocumentsEndpoint: string,
  getDocumentEndpoint: string,
  getTextAnalysisEndpoint: string,
  ankiExportEndpoint: string,
  tsvExportEndpoint: string,
  patreonGoalProgressEndpoint: string
}

export const environment = __DEV__ ? 'development' : 'production';

const devConfiguration: Configuration = {
  apiKey: 'o439rDtClX91ZwvIo7Y8J3esuoulOUOPXFdgOdVf',
  searchDocumentsEndpoint: 'https://8kznbqj5sk.execute-api.us-west-2.amazonaws.com/dev/documents/search',
  getDocumentEndpoint: 'https://8kznbqj5sk.execute-api.us-west-2.amazonaws.com/dev/document/get',
  getTextAnalysisEndpoint: 'https://8kznbqj5sk.execute-api.us-west-2.amazonaws.com/dev/documents/analyze_text',
  ankiExportEndpoint: 'https://85anfvwrza.execute-api.us-west-2.amazonaws.com/dev/exportToAnki',
  tsvExportEndpoint: 'https://85anfvwrza.execute-api.us-west-2.amazonaws.com/dev/exportToTsv',
  patreonGoalProgressEndpoint: 'https://m2pa3megqc.execute-api.us-west-2.amazonaws.com/dev/goal_progress'
};

const prodConfiguration: Configuration = {
  apiKey: 'en4O0MkkEz7Nj1c5HWHShaYOzTt7Grun8s8kO4SF',
  searchDocumentsEndpoint: 'https://fuc7y8w3kd.execute-api.us-west-2.amazonaws.com/prd/documents/search',
  getDocumentEndpoint: 'https://fuc7y8w3kd.execute-api.us-west-2.amazonaws.com/prd/document/get',
  getTextAnalysisEndpoint: 'https://fuc7y8w3kd.execute-api.us-west-2.amazonaws.com/prd/documents/analyze_text',
  ankiExportEndpoint: 'https://puq7ouyr9d.execute-api.us-west-2.amazonaws.com/prd/exportToAnki',
  tsvExportEndpoint: 'https://puq7ouyr9d.execute-api.us-west-2.amazonaws.com/prd/exportToTsv',
  patreonGoalProgressEndpoint: 'https://q98q29aqgc.execute-api.us-west-2.amazonaws.com/prd/goal_progress'
};

function getConfiguration(environment: string): Configuration {
  if (environment === 'production') {
    return prodConfiguration;
  } else if (environment === 'development') {
    return devConfiguration;
  } else {
    throw Error(`Unrecognized environment "${environment}"`);
  }
}

const configuration = getConfiguration(environment);

console.log('configuration', configuration);


// TODO move this to personalized config
export const vocabularyLevelColorPalette = ['#c0392b', '#e67e22', '#f1c40f', '#2ecc71', '#3498db'];

export default configuration;
