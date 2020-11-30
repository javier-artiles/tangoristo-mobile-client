/**
 * @flow
 */


import React from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions, Linking, Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Actions } from 'react-native-router-flux';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { observer } from 'mobx-react/native';
import type { DictionaryEntry, Document, VocabularyEntry } from '../service/ExternalDocumentService';
import recentlyTappedWordStore from '../store/RecentlyTappedWordStore';
import savedDictionaryEntryStore, { SavedDictionaryEntry } from '../store/SavedVocabularyStore';
import DocumentFeedFilterRow from '../component/DocumentFeedFilterRow';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';
import styleStore from '../store/StyleStore';
import Collapsible from 'react-native-collapsible';
import { fetchNhkEasyRedditPage } from '../util/network';

const Color = require('color');

export type Props = {
  vocabulary: VocabularyEntry[],
  language: string,
  documentTitle: string,
  documentUrl: string,
  documentSiteName: string,
  documentText: string,
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {
  fadeAnim: Animated.Value,
  closing: boolean,
  isRecentWordsCollapsed: boolean,
  isOtherCollapsed: boolean,
  redditUrl: string
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 0 : 20,
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'flex-start',
    borderLeftWidth: 2,
    borderColor: '#95a5a6',
    padding: 10,
  },
  touchableLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  shadow: {
    backgroundColor: 'rgba(52,52,52,0.6)',
    position: 'absolute',
    left: 0,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
});

const DocumentTextDrawerLightbox = observer(class DocumentTextDrawerLightbox extends React.Component<Props, State> {

  static defaultProps = {
    documentUrl: null
  };

  state = {
    fadeAnim: new Animated.Value(0),
    closing: false,
    isRecentWordsCollapsed: false,
    isOtherCollapsed: false,
    redditUrl: null
  };

  componentDidMount() {
    Animated.timing(this.state.fadeAnim, {toValue: 1, duration: 250}).start();

    if (this.props.documentSiteName === 'www3.nhk.or.jp_news_easy') {
      console.log('fetchNhkEasyRedditPage');
      fetchNhkEasyRedditPage(this.props.documentUrl)
        .then(redditUrl => {
          console.log('redditUrl', redditUrl);
          this.setState({redditUrl});
        });
    }
  }

  close() {
    this.setState({closing: true});
    Animated.timing(this.state.fadeAnim, {toValue: 0, duration: 250})
      .start(() => Actions.pop());
  }

  closeAndOpenVocabulary() {
    this.setState({closing: true});
    Animated.timing(this.state.fadeAnim, {toValue: 0, duration: 250})
      .start(() => {
        Actions.pop();
        Actions.textVocabularyScene(
          {
            vocabulary: this.props.vocabulary,
            language: this.props.language,
            title: this.props.documentTitle,
            url: this.props.documentUrl
          });
      });
  }

  renderRecentlyTappedWords(textStyle: {}) {
    return recentlyTappedWordStore.dictionaryEntryQueue
      .filter((dictionaryEntry: DictionaryEntry) => this.props.vocabulary.some(v => v.dictionaryEntry.entSeq === dictionaryEntry.entSeq))
      .map((dictionaryEntry: DictionaryEntry) => {
        const matchingDictionaryEntry =
          this.props.vocabulary.find(v => v.dictionaryEntry.entSeq === dictionaryEntry.entSeq);
        return (
          <TouchableOpacity
            key={dictionaryEntry.entSeq}
            style={{paddingTop: 5, marginBottom: 5, paddingBottom: 5, borderBottomWidth: 1, borderColor: 'lightgray'}}
            onPress={() => {
              Actions.pop();
              Actions.vocabularyEntryScene({
                language: this.props.language,
                dictionaryEntry: dictionaryEntry,
                tokenSequenceOccurrences: matchingDictionaryEntry ? matchingDictionaryEntry.tokenSequenceOccurrences : null
              });
            }}
          >
            <Text
              style={[{fontSize: 20}, textStyle]}
              numberOfLines={1}
            >
              {dictionaryEntry.dictionaryForm}
              {dictionaryEntry.alternateForm &&
                <Text
                  style={{color: 'crimson'}}
                >
                  {`【${dictionaryEntry.alternateForm}】`}
                </Text>
              }
            </Text>
            <Text
              numberOfLines={1}
              style={textStyle}
            >
              {dictionaryEntry.definitions['en'].join('; ')}
            </Text>
          </TouchableOpacity>
        )
      })
  }

  getSeparator(title: string, collapseKey: string, backgroundColor, textColor) {
    return (
      <TouchableOpacity
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          padding: 5,
          paddingLeft: 10
        }}
        onPress={() => {
          const newState = {};
          newState[collapseKey] = !this.state[collapseKey];
          this.setState(newState);
        }}
      >
        <Text style={{
          fontSize: 15,
          fontWeight: '500',
          color: Color(textColor).alpha(0.4)
        }}>
          {title.toUpperCase()}
        </Text>
        <MaterialCommunityIcon
          name={this.state[collapseKey] ? 'chevron-right' : 'chevron-down'}
          style={{
            color: Color('#2c3e50').alpha(0.7),
            fontSize: 24,
            marginRight: 8
          }}
        />
      </TouchableOpacity>
    )
  }

  renderOther(textColor: string, textStyle) {
    return (
      <View>
        <DocumentFeedFilterRow
          title={'Vocabulary list'}
          badgeCount={this.props.vocabulary.length}
          onPress={() => this.closeAndOpenVocabulary()}
          backgroundColor='transparent'
          textColor={textStyle.color}
          iconComponent={
            <MaterialCommunityIcon
              name='format-list-bulleted'
              style={{fontSize:24, color: 'grey'}}
            />
          }
        />
        <DocumentFeedFilterRow
          title={'Saved vocabulary'}
          badgeCount={savedDictionaryEntryStore.find().length}
          onPress={() => {
            const language = 'ja';
            const vocabulary = savedDictionaryEntryStore.find()
              .map((entry: SavedDictionaryEntry) => {
                return {
                  dictionaryEntry: entry.dictionaryEntry,
                  firstOccurrenceOffset: 0,
                  reading: '',
                  tokenSequenceOccurrences: []
                };
              });
            Actions.pop();
            Actions.textVocabularyScene(
              {
                language,
                vocabulary,
                title: this.props.documentTitle,
                url: this.props.documentUrl
              });
          }}
          backgroundColor='transparent'
          textColor={textStyle.color}
          iconComponent={
            <MaterialCommunityIcon
              name='bookmark-outline'
              style={{fontSize:24, color: 'grey'}}
            />
          }
        />
        {this.state.redditUrl &&
        <DocumentFeedFilterRow
          title='Reddit translation'
          onPress={() => Linking.openURL(this.state.redditUrl)}
          iconComponent={
            <MaterialCommunityIcon
              name='reddit'
              style={{fontSize:24, color: 'grey'}}
            />
          }
          backgroundColor='transparent'
          textColor={textStyle.color}
        />
        }
        <DocumentFeedFilterRow
          title='Google Translate'
          onPress={() => {
            Linking.openURL('https://translate.google.com/#ja/en/' + encodeURIComponent(this.props.documentText))
              .catch(err => console.log('An error occurred', err));
          }}
          iconComponent={
            <MaterialCommunityIcon
              name='google-translate'
              style={{fontSize:24, color: 'grey'}}
            />
          }
          backgroundColor='transparent'
          textColor={textStyle.color}
        />
        <DocumentFeedFilterRow
          title='Preferences'
          onPress={() => {
            Actions.pop();
            Actions.preferences();
          }}
          iconComponent={
            <MaterialCommunityIcon
              name='settings'
              style={{fontSize:24, color: 'grey'}}
            />
          }
          backgroundColor='transparent'
          textColor={textStyle.color}
        />
      </View>
    )
  }

  render () {
    const { darkModeEnabled } = this.props.globalPreferencesStore;
    const backgroundStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textStyle = styleStore.getTextColorStyle(darkModeEnabled);
    const textColor = styleStore.getTextColor(darkModeEnabled);
    const separatorBackgroundColor = darkModeEnabled ? '#8e8e8e' : '#f0f0f0';
    return (
      <TouchableOpacity
        style={styles.touchableLayer}
        onPress={() => this.close()}
        activeOpacity={1}
      >
        <Animated.View
          style={[styles.shadow, {opacity: this.state.fadeAnim}]}
        />
        <Animatable.View
          animation={this.state.closing ? 'fadeOutRight' : 'fadeInRight'}
          duration={this.state.closing ? 250 : 400}
          style={{position: 'absolute', right: 0, width: Dimensions.get('window').width * 0.8, height: Dimensions.get('window').height}}
        >
          <TouchableOpacity activeOpacity={1} style={{flex: 1}}>
            <SafeAreaView style={[styles.container, backgroundStyle]}>
              {this.getSeparator('Links', 'isOtherCollapsed', separatorBackgroundColor, textColor)}
              <Collapsible collapsed={this.state.isOtherCollapsed}>
                {this.renderOther(textColor, textStyle)}
              </Collapsible>
              {this.getSeparator('Recent words', 'isRecentWordsCollapsed', separatorBackgroundColor, textColor)}
              <Collapsible collapsed={this.state.isRecentWordsCollapsed}>
                <ScrollView style={{paddingLeft: 10}}>
                  {this.renderRecentlyTappedWords(textStyle)}
                </ScrollView>
              </Collapsible>
            </SafeAreaView>
          </TouchableOpacity>
        </Animatable.View>
      </TouchableOpacity>
    );
  }
});

export default DocumentTextDrawerLightbox;