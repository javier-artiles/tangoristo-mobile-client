/**
 * @flow
 */

import { Actions } from 'react-native-router-flux';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { vocabularyLevelColorPalette } from '../configuration/Configuration';
import React from 'react';
import type { DictionaryEntry, TokenSequence } from '../service/ExternalDocumentService';


type Props = {
  dictionaryEntry: DictionaryEntry,
  tokenSequenceOccurrences: TokenSequence[]
}

type State = {}

const styles = StyleSheet.create({
});

export default class VocabularyListItem extends React.Component<Props, State> {
  render () {
    const {dictionaryEntry, tokenSequenceOccurrences} = this.props;
    const {officialProficiencyLevel} = dictionaryEntry;
    const vocabularyLevelIndex = officialProficiencyLevel !== 'UNKNOWN'
      ? Number.parseInt(officialProficiencyLevel.replace('JLPT_N', '') - 1)
      : null;
    return (
      <TouchableOpacity
        onPress={() => Actions.vocabularyEntryScene({
          language: this.props.language,
          dictionaryEntry: dictionaryEntry,
          tokenSequenceOccurrences: tokenSequenceOccurrences
        })}
        style={{
          backgroundColor: 'white',
          padding: 10,
          paddingLeft: 15,
          height: 60,
          borderBottomWidth: 1,
          borderBottomColor: '#95a5a6'
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: 60,
            width: 5,
            backgroundColor: vocabularyLevelIndex !== null
              ? vocabularyLevelColorPalette[vocabularyLevelIndex]
              : 'transparent'
          }}
        />
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 24}}>
            {dictionaryEntry.dictionaryForm}
            {!!dictionaryEntry.alternateForm &&
            <Text style={{color: '#c0392b'}}>
              【{dictionaryEntry.alternateForm}】
            </Text>
            }
          </Text>
          <Text style={{marginLeft: 10, fontSize: 14, fontStyle: 'italic'}}>
            {dictionaryEntry.partOfSpeech[0].replace('_', ' ')}
          </Text>
        </View>
        <Text
          numberOfLines={1}
        >
          {dictionaryEntry.definitions['en'].join('; ')}
        </Text>
      </TouchableOpacity>
    );
  }
}