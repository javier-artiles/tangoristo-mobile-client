/**
 * @flow
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import savedDictionaryEntryStore from '../store/SavedVocabularyStore';
import type { DictionaryEntry, TokenSequence } from '../service/ExternalDocumentService';
import { Actions } from 'react-native-router-flux';
import {jaPosCodeDict} from "../store/VocabularyCodes";

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 15,
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderTopColor: '#95a5a6',
    height: Platform.OS === 'android' ? 150 :  120
  },
  dictionaryForm: {
    fontSize: 25,
    marginBottom: 5
  },
  alternateForm: {
    color: '#c0392b'
  },
  definition: {
    fontSize: 16
  },
  bookmarkButton: {
    position: 'absolute',
    top: 5,
    right: 20,
    backgroundColor: 'transparent',
    padding: 5,
    zIndex: 10,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#95a5a6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  partOfSpeechContainer: {
    position: 'absolute',
    top: 10,
    right: 172,
    backgroundColor: 'transparent',
    padding: 4,
    paddingLeft: 7,
    paddingRight: 7,
    zIndex: 10,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#95a5a6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  partOfSpeechText: {
    fontSize: 13,
  },
  commonWordContainer: {
    position: 'absolute',
    top: 10,
    right: 125,
    backgroundColor: 'transparent',
    padding: 4,
    paddingLeft: 7,
    paddingRight: 7,
    zIndex: 10,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#95a5a6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commonWordText: {
    fontSize: 13,
  },
  officialProficiencyLevelContainer: {
    position: 'absolute',
    top: 10,
    right: 75,
    backgroundColor: 'transparent',
    padding: 5,
    zIndex: 10,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#95a5a6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  officialProficiencyLevelText: {
    fontSize: 11,
    color: 'white'
  }
});


type Props = {
  language: string,
  inflectionName: ?string,
  inflectionForm: ?string,
  dictionaryEntry: DictionaryEntry,
  tokenSequenceOccurrences: TokenSequence[],
  backgroundStyle: {},
  textStyle: {}
}

type State = {
}

export default class DictionaryHint extends React.Component<Props, State> {

  handleBookmarkPress(isBookmarked: boolean) {
    console.log('handleBookmarkPress', isBookmarked, this.props.dictionaryEntry, this.props.language);
    if (isBookmarked) {
      savedDictionaryEntryStore.remove(this.props.dictionaryEntry.entSeq, this.props.language);
    } else {
      savedDictionaryEntryStore.put(this.props.dictionaryEntry, this.props.language);
    }
    this.forceUpdate();
  }

  render() {
    const isBookmarked = savedDictionaryEntryStore.has(this.props.dictionaryEntry.entSeq, this.props.language);
    const dictionaryForm = this.props.dictionaryEntry.dictionaryForm;
    const alternateForm = this.props.dictionaryEntry.alternateForm;
    const partOfSpeech = Array.from(new Set(this.props.dictionaryEntry.partOfSpeech)).map(pos => pos.replace('_', ' '));
    const definition = Object.keys(this.props.dictionaryEntry.definitions)
      .filter(k => k === 'en')
      .map(k => this.props.dictionaryEntry.definitions[k])
      .join('; ') + '.';
    const officialProficiencyLevel = this.props.dictionaryEntry.officialProficiencyLevel === 'UNKNOWN'
      ? null
      : this.props.dictionaryEntry.officialProficiencyLevel.replace('JLPT_', '');
    const detailStrings = [];
    if (officialProficiencyLevel) {
      detailStrings.push(officialProficiencyLevel);
    }
    if (partOfSpeech && partOfSpeech.length > 0 && partOfSpeech[0] in jaPosCodeDict) {
      detailStrings.push(jaPosCodeDict[partOfSpeech[0]]);
    }
    return (
      <TouchableOpacity
        style={[styles.container, this.props.backgroundStyle]}
        onPress={() => Actions.vocabularyEntryScene({
          language: this.props.language,
          dictionaryEntry: this.props.dictionaryEntry,
          tokenSequenceOccurrences: this.props.tokenSequenceOccurrences
        })}
      >
        <TouchableOpacity
          activeOpacity={0.5}
          style={[
            styles.bookmarkButton,
            this.props.backgroundStyle
          ]}
          onPress={() => this.handleBookmarkPress(isBookmarked)}
        >
          <MaterialCommunityIcon
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            style={[{
              fontSize: 22
            }, this.props.textStyle]}
          />
        </TouchableOpacity>
        <View style={{flexDirection: 'row'}}>
          <Text style={[styles.dictionaryForm, this.props.textStyle]}>
            {dictionaryForm}
            {!!alternateForm &&
            <Text style={styles.alternateForm}>
              【{alternateForm}】
            </Text>
            }
          </Text>
          {!!this.props.inflectionName && !!this.props.inflectionForm &&
          <View style={{paddingLeft: 5}}>
            <Text style={this.props.textStyle}>
              {this.props.inflectionForm}
            </Text>
            <Text style={[{fontSize: 10}, this.props.textStyle]}>
            {this.props.inflectionName}
            </Text>
          </View>
          }
        </View>
        <View
          style={{marginBottom: 5, flexDirection: 'row'}}
        >
          <Text style={[this.props.textStyle, {color: 'gray'}]}>
            {detailStrings.join(' • ')}
          </Text>
        </View>
        <Text
          style={[styles.definition, this.props.textStyle]}
          numberOfLines={3}
        >
          {definition}
        </Text>
      </TouchableOpacity>
    );
  }
}