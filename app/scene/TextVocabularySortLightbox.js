/**
 * @flow
 */

import React from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import textVocabularyPreferencesStore from '../store/TextVocabularyPreferencesStore';

type Props = {}

type State = {}

const HIGHLIGHT_SORT_BACKGROUND_COLOR = '#f3d7a0';

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'rgba(52,52,52,0.8)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default class TextVocabularySortLightbox extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
    }
  }

  onFilter(sortBy: string, sortAsc: boolean) {
    textVocabularyPreferencesStore.setSortBy(sortBy);
    textVocabularyPreferencesStore.setIsAsc(sortAsc);
    Actions.pop();
  }

  getSortRow(title: string, sortBy: string, sortAsc: boolean) {
    const isSelected = textVocabularyPreferencesStore.vocabularySortBy === sortBy
      && textVocabularyPreferencesStore.vocabularyIsAsc === sortAsc;
    const backgroundColor = isSelected ? HIGHLIGHT_SORT_BACKGROUND_COLOR : 'white';
    return (
      <TouchableOpacity
        style={{
          height: 50,
          width: 220,
          backgroundColor: backgroundColor,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 15,
          borderRadius: 25,
          marginBottom: 20
        }}
        onPress={() => this.onFilter(sortBy, sortAsc)}
      >
        <Text
          style={{
            fontSize: 20
          }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <TouchableOpacity
        style={styles.shadow}
        onPress={() => Actions.pop()}
      >
        <SafeAreaView style={styles.container}>
          {this.getSortRow('Descending level', 'level', false)}
          {this.getSortRow('Ascending level', 'level', true)}
          {this.getSortRow('Descending type', 'pos', false)}
          {this.getSortRow('Ascending type', 'pos', true)}
        </SafeAreaView>
      </TouchableOpacity>
    )
  }

}