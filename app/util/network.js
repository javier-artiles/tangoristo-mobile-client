/**
 * @flow
 */

import { fromJS } from 'immutable';
import { NetInfo } from 'react-native';


export const isNetworkConnected = () => {
  return NetInfo.getConnectionInfo().then(reachability => {
    if (reachability.type === 'unknown') {
      return new Promise(resolve => {
        const handleFirstConnectivityChangeIOS = isConnected => {
          NetInfo.isConnected.removeEventListener('connectionChange', handleFirstConnectivityChangeIOS);
          resolve(isConnected);
        };
        NetInfo.isConnected.addEventListener('connectionChange', handleFirstConnectivityChangeIOS);
      });
    }
    return (reachability.type !== 'none' && reachability.type !== 'unknown');
  });
};

export function fetchWithTimeout(url, delay=3000) {
  // construct an array to pass to `Promise.race`
  return Promise.race([
    fetch(url),
    timeout(delay)
  ]);
}

function wait(delay = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, delay);
  });
}

// https://www.eventbrite.com/engineering/learning-es6-promises/
function timeout(delay=3000) {
  return wait(delay).then(() => {
    throw new Error('Timed out!');
  });
}


export function fetchNhkEasyRedditPage(url: string) {
  return isNetworkConnected()
    .then(isConnected => {
      if (isConnected) {
        const encodedUrl = encodeURIComponent(url);
        const redditApiUrl = `https://www.reddit.com/r/NHKEasyNews/search.json?q=selftext:${encodedUrl}&sort=new`;
        return fetchWithTimeout(redditApiUrl, 2000)
          .then((response) => response.json())
          .then((responseJson) => {
            console.log('responseJson', responseJson);
            const redditPostUrl = fromJS(responseJson).getIn(['data', 'children', 0, 'data', 'url']);
            if (redditPostUrl) {
              return redditPostUrl;
            } else {
              return null;
            }
          });
      }
    });
}