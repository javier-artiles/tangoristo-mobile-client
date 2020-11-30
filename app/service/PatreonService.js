/**
 * @flow
 */

import configuration from '../configuration/Configuration';
import {Cache} from "react-native-cache";
import {AsyncStorage} from "react-native";

const patreonServiceCache = new Cache({
  namespace: "patreon",
  policy: {
    maxEntries: 1
  },
  backend: AsyncStorage
});

class PatreonService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async getFundingGoalProgress(): number {
    try {
      const response = await fetch(this.endpoint);
      const json = await response.json();
      const {pledge_in_cents, goal_in_cents} = json;
      const progress = pledge_in_cents / goal_in_cents;
      await patreonServiceCache.setItem('progress', progress, function(err) {
        if (err) {
          console.warn(`Failed to set funding progress cache`, err);
        }
      });
      return progress;
    } catch (error) {
      return new Promise(function(resolve, reject) {
        patreonServiceCache.getItem('progress', function(err, value) {
          if (err) {
            console.log(err);
            resolve(null);
          } else {
            resolve(value);
          }
        });
      });
    }
  }
}

const patreonService = new PatreonService(configuration.patreonGoalProgressEndpoint);
export default patreonService;