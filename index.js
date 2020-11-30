/**
 * @flow
 */

import { AppRegistry } from 'react-native';
import globalPreferencesStore from './app/store/GlobalPreferencesStore';
const App = require('./app/App.js');

AppRegistry.registerComponent('tangoristo', () => App);
