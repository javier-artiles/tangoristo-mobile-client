/**
 * @flow
 */

import React from 'react';
import { View, Text, Slider, StyleSheet, Dimensions, Switch } from 'react-native';
import { observer } from 'mobx-react/native';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';

const ISO6391 = require('iso-639-1');

type Props = {
  textColor: string,
  backgroundColor: string,
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 18,
    paddingRight: 35,
    paddingBottom: 10,
    paddingTop: 10
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  text: {
    paddingLeft: 10,
    fontSize: 20
  },
  nestedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10
  },
  nestedRowText: {
    paddingLeft: 10,
    fontSize: 18
  }
});

const preferencesVocabularyPanel = observer(class PreferencesVocabularyPanel extends React.Component<Props, State> {

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  renderLanguageToggles(textColorStyle: {}) {
    return [
      'nl',
      'fr',
      'de',
      'hu',
      'it',
      'ru',
      'sl',
      'es',
      'sv'
    ].map((code: string) => {
      const label = this.capitalizeFirstLetter(ISO6391.getNativeName(code));
      const onValueChange = enable => {
        this.props.globalPreferencesStore.setExtraDefinitionLanguageEnabled(code, enable);
      };
      const value = this.props.globalPreferencesStore.extraDefinitionLanguages.includes(code);
      return this.renderSwitch(label, onValueChange, value, textColorStyle);
    });
  }

  renderSwitch(label: string, onValueChange, value, textColorStyle) {
    const windowWidth = Dimensions.get('window').width;
    return (
      <View
        key={label}
        style={[styles.nestedRow, {width: windowWidth - 60}]}
      >
        <Text style={[styles.nestedRowText, textColorStyle]}>
          {label}
        </Text>
        <Switch
          onValueChange={onValueChange}
          value={value}
        />
      </View>
    )
  }

  render() {
    const textColorStyle = {color: this.props.textColor};
    return (
      <View style={[styles.container, {backgroundColor: this.props.backgroundColor}]}>
        <View style={styles.row}>
          <Text style={[styles.text, {marginBottom: 20}, textColorStyle]}>
            Additional languages in definitions
          </Text>
          {this.renderLanguageToggles(textColorStyle)}
        </View>
      </View>
    )
  }
});

export default preferencesVocabularyPanel;