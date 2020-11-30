/**
 * @flow
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import documentCache from '../store/DocumentCache';
import documentSearchCache from '../store/DocumentSearchCache';

type Props = {
  textColor: string,
  backgroundColor: string,
  onClearCachedArticles: (numCleared: number) => {},
  onClearCachedSearchResults: (numCleared: number) => {}
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
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 10,
    fontSize: 20
  },
});

export default class PreferencesCachePanel extends React.Component<Props, State> {
  render () {
    const textColorStyle = {color: this.props.textColor};
    return (
      <View style={[styles.container, {backgroundColor: this.props.backgroundColor}]}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => {
              documentCache.clearAll()
                .then(numCleared => this.props.onClearCachedArticles(numCleared))
                .catch(err => console.warn(err));
            }}
          >
            <Text style={[styles.text, textColorStyle]}>
              Clear all cached articles
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              documentSearchCache.clearAll()
                .then(() => this.props.onClearCachedSearchResults())
                .catch(err => console.warn(err));
            }}
          >
            <Text style={[styles.text, textColorStyle]}>
              Clear all cached search results
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
