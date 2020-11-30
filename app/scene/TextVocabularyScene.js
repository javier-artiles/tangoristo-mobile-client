/**
 * @flow
 */


import React from "react";
import {StyleSheet, View, SafeAreaView, Text, TouchableOpacity, FlatList, Platform} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { observer } from 'mobx-react/native';
import type { VocabularyEntry } from '../service/ExternalDocumentService';
import { vocabularyLevelColorPalette } from '../configuration/Configuration';
import VocabularyListNavBar from '../component/VocabularyListNavBar';
import textVocabularyPreferencesStore from '../store/TextVocabularyPreferencesStore';
import SearchBox from '../component/SearchBox';
import globalPreferencesStore from '../store/GlobalPreferencesStore';
import styleStore from '../store/StyleStore';
import AdBanner from '../component/AdBanner';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';


type Props = {
  vocabulary: VocabularyEntry[],
  language: string,
  title: string,
  url: string,
  isBookmarks: boolean
}

type State = {
  showFilterDrawer: boolean,
  showSearchBox: boolean,
  textFilter: string
}


const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 0 : 20,
    flex: 1
  }
});


const TextVocabularyScene = observer(class TextVocabularyScene extends React.Component<Props, State> {
  static defaultProps = {
    isBookmarks: false
  };

  constructor (props: Props) {
    super(props);
    this.state = {
      showFilterDrawer: false,
      showSearchBox: false,
      textFilter: ''
    }
  }

  renderVocabularyEntry(vocabularyEntry: VocabularyEntry, textStyle: {}, backgroundStyle: {}) {
    const { officialProficiencyLevel } = vocabularyEntry.dictionaryEntry;
    const vocabularyLevelIndex = officialProficiencyLevel !== 'UNKNOWN'
      ? Number.parseInt(officialProficiencyLevel.replace('JLPT_N', '') - 1)
      : null;
    return (
      <TouchableOpacity
        onPress={() => Actions.vocabularyEntryScene({
          language: this.props.language,
          dictionaryEntry: vocabularyEntry.dictionaryEntry,
          tokenSequenceOccurrences: vocabularyEntry.tokenSequenceOccurrences
        })}
        style={[{
          paddingRight: 10,
          paddingLeft: 15,
          height: 65,
          justifyContent: 'center',
          borderBottomWidth: 1.5,
          // borderBottomColor: '#95a5a6'
          borderBottomColor: '#bdc3c7'
        }, backgroundStyle]}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: 65,
            width: 5,
            backgroundColor: vocabularyLevelIndex !== null
              ? vocabularyLevelColorPalette[vocabularyLevelIndex]
              : 'transparent'
          }}
        />
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text
            style={[{fontSize: 24}, textStyle]}
            numberOfLines={1}
          >
            {vocabularyEntry.dictionaryEntry.dictionaryForm}
            {!!vocabularyEntry.dictionaryEntry.alternateForm &&
            <Text style={{color: '#c0392b'}}>
              【{vocabularyEntry.dictionaryEntry.alternateForm}】
            </Text>
            }
          </Text>
          <Text style={[{marginLeft: 10, fontSize: 14, fontStyle: 'italic'}, textStyle]}>
            {vocabularyEntry.dictionaryEntry.partOfSpeech[0].replace('_', ' ')}
          </Text>
        </View>
        <Text
          numberOfLines={1}
          style={textStyle}
        >
          {vocabularyEntry.dictionaryEntry.definitions['en'].join('; ')}
        </Text>
      </TouchableOpacity>
    )
  }

  sortAndFilter(vocabulary: VocabularyEntry[]): VocabularyEntry[] {
    return vocabulary.filter(entry => {
      const {officialProficiencyLevel, partOfSpeech} = entry.dictionaryEntry;
      const isInLevelFilter = textVocabularyPreferencesStore.isInLevelFilter(this.props.language, officialProficiencyLevel);
      const isInPosFilter = textVocabularyPreferencesStore.isInPosFilter(this.props.language, partOfSpeech[0]);
      const isInTextFilter = this.isInTextFilter(entry);
      return isInLevelFilter && isInPosFilter && isInTextFilter;
    }).sort((entryA: VocabularyEntry, entryB: VocabularyEntry) => {
      const {vocabularySortBy, vocabularyIsAsc} = textVocabularyPreferencesStore;
      let comparison = 0;
      if (vocabularySortBy === 'level') {
        comparison = this.compareByLevel(entryA, entryB);
        if (comparison === 0) {
          comparison = this.compareByType(entryA, entryB)
        }
      } else if (vocabularySortBy === 'pos') {
        comparison = this.compareByType(entryA, entryB);
        if (comparison === 0) {
          comparison = this.compareByLevel(entryA, entryB);
        }
      }
      return vocabularyIsAsc ? comparison : -comparison;
    });
  }

  isInTextFilter(entry: VocabularyEntry): boolean {
    if (!this.state.textFilter || this.state.textFilter.length === 0) {
      return true;
    }
    const {dictionaryForm, alternateForm, definitions} = entry.dictionaryEntry;
    return (dictionaryForm && dictionaryForm.includes(this.state.textFilter))
      || (alternateForm && alternateForm.includes(this.state.textFilter)
      || (definitions.en.join('#').toLowerCase().includes(this.state.textFilter.toLowerCase())));
  }

  compareByLevel(entryA: VocabularyEntry, entryB: VocabularyEntry): number {
    const levelA = this.getLevelAsNumber(entryA);
    const levelB = this.getLevelAsNumber(entryB);
    return levelB - levelA;
  }

  compareByType(entryA: VocabularyEntry, entryB: VocabularyEntry): number {
    const posA = this.getTopPos(entryA);
    const posB = this.getTopPos(entryB);
    return posA.localeCompare(posB);
  }

  getLevelAsNumber(entry: VocabularyEntry): number {
    return Number.parseInt(entry.dictionaryEntry.officialProficiencyLevel.replace('UNKNOWN', '0').replace('JLPT_N', '') - 1);
  }

  getTopPos(entry: VocabularyEntry): string {
    const {partOfSpeech} = entry.dictionaryEntry;
    return !partOfSpeech || partOfSpeech.length === 0
      ? ''
      : partOfSpeech[0];
  }

  onPressFilter = () => {
    const posList = this.props.vocabulary.map(voc => voc.dictionaryEntry.partOfSpeech[0]);
    const levelList = this.props.vocabulary.map(voc => voc.dictionaryEntry.officialProficiencyLevel);
    Actions.vocabularyFilter({posList, levelList, language: this.props.language});
  };

  onPressCloseSearchBox = () => {
    this.setState({showSearchBox: false});
  };

  onPressOpenSearchBox = () => {
    this.setState({showSearchBox: true});
  };

  onPressExport = () => {
    const {vocabulary, title, url} = this.props;
    Actions.vocabularyExport({vocabulary, title, url});
  };

  onSearch = (query: string) => {
    this.setState({textFilter: query});
  };

  render () {
    const { darkModeEnabled } = globalPreferencesStore;
    const backgroundStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textStyle = styleStore.getTextColorStyle(darkModeEnabled);
    const vocabulary = this.sortAndFilter(this.props.vocabulary);
    return (
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        {!this.state.showSearchBox &&
        <VocabularyListNavBar
          onPressFilter={this.onPressFilter}
          onPressExport={this.onPressExport}
          onPressOpenSearchBox={this.onPressOpenSearchBox}
          backgroundStyle={backgroundStyle}
          textStyle={textStyle}
        />
        }
        {this.state.showSearchBox &&
          <SearchBox
            onPressClose={this.onPressCloseSearchBox}
            onSearch={this.onSearch}
            initialText={this.state.textFilter}
          />
        }
        {this.props.isBookmarks && vocabulary.length === 0 &&
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <MaterialCommunityIcon
              name={'bookmark-outline'}
              style={[{fontSize: 40}, textStyle]}
            />
            <Text style={[{fontSize: 18, width: 200, textAlign: 'center'}, textStyle]}>
              To see your saved vocabulary here use the bookmark icon next to each word entry
            </Text>
          </View>
        }
        {vocabulary.length >= 0 &&
        <FlatList
          data={vocabulary}
          style={{marginTop: 5, borderWidth: 0.5, borderColor: 'white'}}
          keyExtractor={(vocabularyEntry: VocabularyEntry, index: number) => {
            return vocabularyEntry.dictionaryEntry.entSeq.toString();
          }}
          renderItem={({item}) => this.renderVocabularyEntry(item, textStyle, backgroundStyle)}
        />
        }
        <AdBanner/>
      </SafeAreaView>
    );
  }
});

export default TextVocabularyScene;