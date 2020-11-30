/**
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Image,
  Text,
  StatusBar,
  Platform,
  TouchableOpacity
} from 'react-native';
import externalDocumentService from '../service/ExternalDocumentService';
import type {
  Document,
  Hit,
  LinkedText,
  TokenSequence,
  VocabularyEntry
} from '../service/ExternalDocumentService';
import DocumentTextNavBar from '../component/DocumentTextNavBar';
import * as Animatable from 'react-native-animatable';
import Dimensions from 'react-native/Libraries/Utilities/Dimensions';
import moment from 'moment';
import 'moment/locale/ja';
import DictionaryHint from '../component/DictionaryHint';
import savedDocumentStore from '../store/SavedDocumentStore';
import AudioPlayerBar from '../component/AudioPlayerBar';
import { Actions } from 'react-native-router-flux';
import recentlyTappedWordStore from '../store/RecentlyTappedWordStore';
import { observer } from 'mobx-react/native';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';
import { speak } from '../util/speech';
import styleStore from '../store/StyleStore';
import RichTextPanel from '../component/RichTextPanel';
import {getSentence} from "../util/text";

const Device = require('react-native-device-detection');

type Props = {
  globalPreferencesStore: GlobalPreferencesStore,
  articleKey: string,
  hit: Hit
}

type State = {
  document: Document,
  vocabulary: VocabularyEntry[],
  navBarAnimation: string,
  latestScrollYPosition: number,
  failedToLoadImage: boolean,
  selectedVocabularyEntry: ?VocabularyEntry,
  selectedTokenSequence: ?TokenSequence,
  textLookAheadSize: number,
  showAudioPlayer: boolean,
  tappedEntSeqToCount: Map<number, number>,
  scrollViewYPosition: number
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 1 : 10,
    backgroundColor: 'white',
    flex: 1
  }
});

const leadingMediaHeight = Device.isTablet ? 300 : 200;

const documentTextScene = observer(class DocumentTextScene extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      document: null,
      vocabulary: null,
      navBarAnimation: null,
      latestScrollYPosition: 0,
      failedToLoadImage: false,
      selectedVocabularyEntry: null,
      selectedTokenSequence: null,
      textLookAheadSize: 150, // TODO consider different numbers as a function of text size and screen height
      showAudioPlayer: false,
      tappedEntSeqToCount: new Map(),
      scrollViewYPosition: null
    }
  }

  componentDidMount() {
    console.log('componentDidMount');
    if (savedDocumentStore.has(this.props.hit.id, this.props.hit.language)) {
      console.log('Fetching document from saved document store in Realm');
      const document = savedDocumentStore.getAsDocument(this.props.hit.id, this.props.hit.language);
      this.onReceivedDocument(document);
    } else {
      externalDocumentService.getDocument(this.props.articleKey)
        .then((document) => this.onReceivedDocument(document));
    }
  }

  onReceivedDocument(document: Document) {
    console.log('document', document);
    const titleVocabulary = document.analysis.titleAnalysis.vocabulary;
    const bodyVocabulary = document.analysis.bodyAnalysis.vocabulary;
    const vocabulary = this.mergeAndDedup(titleVocabulary, bodyVocabulary);
    this.setState({document, vocabulary});
  }

  mergeAndDedup(titleVocabulary: VocabularyEntry[], bodyVocabulary: VocabularyEntry[]): VocabularyEntry[] {
    const entSeqToEntry = new Map();
    this.mergeVocabulary(entSeqToEntry, bodyVocabulary);
    this.mergeVocabulary(entSeqToEntry, titleVocabulary);
    return Array.from(entSeqToEntry.values());
  }

  mergeVocabulary(entSeqToEntry: Map<String, VocabularyEntry>, entries: VocabularyEntry[]): void {
    entries.forEach(entry => {
      const key = entry.dictionaryEntry.entSeq.toString();
      if (!entSeqToEntry.has(key)) {
        entSeqToEntry.set(key, entry);
      }
    });
  }

  renderLeadingImage(imageUrl: string, imageHeight: number) {
    return (
      <Image
        resizeMode={'cover'}
        style={{width: Dimensions.get('window').width, height: imageHeight}}
        source={{uri: imageUrl}}
        onError={(error) => this.setState({failedToLoadImage: true})}
      />);
  }

  handleWordPress = async (vocabularyEntry: VocabularyEntry, tokenSequence: TokenSequence, linkedText: LinkedText) => {
    console.log('handleWordPress', vocabularyEntry, tokenSequence, linkedText);

    const officialProficiencyLevelString = vocabularyEntry && vocabularyEntry.dictionaryEntry
      ? vocabularyEntry.dictionaryEntry.officialProficiencyLevel
      : null;
    const officialProficiencyLevel = officialProficiencyLevelString && officialProficiencyLevelString.startsWith('JLPT_N')
      ? parseInt(officialProficiencyLevelString.replace('JLPT_N', ''))
      : null;
    const {
      furiganaByJlptLevel,
      furiganaForOutOfJlptWords
    } = this.props.globalPreferencesStore;
    const furiganaEnabled =  vocabularyEntry && vocabularyEntry.dictionaryEntry &&
      ((furiganaByJlptLevel.includes(officialProficiencyLevel)
        || (!officialProficiencyLevel && furiganaForOutOfJlptWords)));
    let tapCount = 0;
    if (this.props.globalPreferencesStore.tapToRevealFuriganaEnabled
        && vocabularyEntry
        && vocabularyEntry.dictionaryEntry
        && vocabularyEntry.dictionaryEntry.entSeq
    ) {
      const {entSeq} = vocabularyEntry.dictionaryEntry;
      if (this.state.tappedEntSeqToCount.has(entSeq)) {
        tapCount = this.state.tappedEntSeqToCount.get(entSeq) + 1;
      } else {
        tapCount = 1;
      }
      if (tapCount > 2) {
        this.state.tappedEntSeqToCount.delete(entSeq);
      } else {
        this.state.tappedEntSeqToCount.set(entSeq, tapCount);
      }
      this.setState({tappedEntSeqToCount: new Map(this.state.tappedEntSeqToCount)});
    }

    const selectedVocabularyEntry: ?VocabularyEntry = this.state.selectedVocabularyEntry === vocabularyEntry
      ? null
      : vocabularyEntry;
    const selectedTokenSequence = selectedVocabularyEntry && tokenSequence ? tokenSequence : null;
    let closingHint = false;
    if (!!selectedVocabularyEntry && !!this.state.selectedVocabularyEntry) {
      this.setState({ selectedVocabularyEntry, selectedTokenSequence });
      recentlyTappedWordStore.putDictionaryEntry(selectedVocabularyEntry.dictionaryEntry);
      console.log('A');
    } else if ((this.props.globalPreferencesStore.tapToRevealFuriganaEnabled
                && selectedVocabularyEntry
                && selectedTokenSequence
                && (furiganaEnabled || selectedTokenSequence.surfaceReading === selectedTokenSequence.surfaceForm)) ||
      !!selectedVocabularyEntry &&
        (!this.props.globalPreferencesStore.tapToRevealFuriganaEnabled ||
            (this.props.globalPreferencesStore.tapToRevealFuriganaEnabled && tapCount === 2))
    ) {
      console.log('B');
      this.setState({ selectedVocabularyEntry, selectedTokenSequence }, () => this._vocabularyHintView.slideInUp(250));
      recentlyTappedWordStore.putDictionaryEntry(selectedVocabularyEntry.dictionaryEntry);
    } else if (this._vocabularyHintView) {
      console.log('C');
      closingHint = true;
      this._vocabularyHintView.slideOutDown(250).then(() => this.setState({ selectedVocabularyEntry, selectedTokenSequence }));
    } else {
      console.log('D', furiganaEnabled);
    }

    let pronounceText = null;
    if (tokenSequence && tokenSequence.surfaceReading) {
      pronounceText = tokenSequence.surfaceReading;
    } else if (linkedText && linkedText.surfaceList) {
      pronounceText = linkedText.surfaceList.join('');
    }

    if (this.props.globalPreferencesStore.pronounceWordOnTap && pronounceText && !closingHint) {
      speak(pronounceText, this.props.globalPreferencesStore.defaultVoiceId);
    }
  };

  handleLongWordPressInTitle = (vocabularyEntry: VocabularyEntry, tokenSequence: TokenSequence, linkedText: LinkedText) => {
    try {
      const sentence = getSentence(linkedText, this.state.document.analysis.titleAnalysis.linkedText);
      this.handleLongWordPress(sentence, vocabularyEntry, tokenSequence, linkedText);
    } catch(error) {
      console.log(error);
    }
  };

  handleLongWordPressInBody = (vocabularyEntry: VocabularyEntry, tokenSequence: TokenSequence, linkedText: LinkedText) => {
    try {
      const sentence = getSentence(linkedText, this.state.document.analysis.bodyAnalysis.linkedText);
      this.handleLongWordPress(sentence, vocabularyEntry, tokenSequence, linkedText);
    } catch(error) {
      console.log(error);
    }
  };

  handleLongWordPress = (sentence: string, vocabularyEntry: VocabularyEntry, tokenSequence: TokenSequence, linkedText: LinkedText) => {
    const { text } = this.state.document.structure;
    let surface = null;
    let reading = null;
    if (tokenSequence) {
      surface = tokenSequence.surfaceForm;
      reading = tokenSequence.surfaceReading;
    } else if (vocabularyEntry && vocabularyEntry.dictionaryEntry) {
      surface = vocabularyEntry.dictionaryEntry.dictionaryForm;
      reading = vocabularyEntry.dictionaryEntry.alternateForm;
    } else if (linkedText && linkedText.surfaceList) {
      surface = linkedText.surfaceList.join('');
    }
    Actions.wordContextualMenu({sentence, surface, reading, text, vocabularyEntry});
  };

  handleTextScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const yDelta = currentY - this.state.latestScrollYPosition;
    let navBarAnimation = this.state.navBarAnimation;
    if (currentY >= 0 && Math.abs(yDelta) > 100) {
      navBarAnimation = yDelta > 0
        ? 'fadeOutUp'
        : 'fadeInDown';
    }
    if (currentY >= 0 && currentY <= 10 && this.state.navBarAnimation === 'fadeOutUp') {
      navBarAnimation = 'fadeInDown';
    }
    this.setState({latestScrollYPosition: currentY, navBarAnimation});

    if (this.isCloseToBottom(event.nativeEvent) && !!this.state.document) {
      console.log('isCloseToBottom');
      const increaseSize = 50;
      const textLookAheadSize = Math.min(
        this.state.textLookAheadSize + increaseSize,
        this.state.document.analysis.bodyAnalysis.linkedText.length
      );
      this.setState({textLookAheadSize})
    }
  };

  isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 100;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  handleOpenInBrowserPress = () => {
    Linking.openURL(this.state.document.structure.url);
  };

  handleBookmarkPress = () => {
    if (!this.state.document) {
      console.log('Not ready for bookmarking (document has not loaded yet)');
      return;
    }
    const isBookmarked = savedDocumentStore.has(this.props.hit.id, this.props.hit.language);
    if (isBookmarked) {
      console.log('removing document bookmark');
      savedDocumentStore.remove(this.props.hit.id, this.props.hit.language);
      this.forceUpdate();
    } else {
      console.log('saving document bookmark');
      savedDocumentStore.put(this.props.hit, this.state.document, this.props.hit.language);
    }
    this.forceUpdate();
  };

  handleAudioPress = () => {
    this.setState({showAudioPlayer: !this.state.showAudioPlayer});
  };

  handleDrawerPress = () => {
    Actions.documentTextDrawer({
      vocabulary: this.state.vocabulary,
      language: this.state.document.analysis.bodyAnalysis.language,
      globalPreferencesStore: this.props.globalPreferencesStore,
      documentTitle: this.state.document.structure.title,
      documentUrl: this.state.document.structure.url,
      documentSiteName: this.state.document.site_name,
      documentText: `${this.state.document.structure.title}\n${this.state.document.structure.text}`
    });
  };

  renderDictionaryHint(
    vocabularyEntry: VocabularyEntry,
    selectedTokenSequence: TokenSequence,
    backgroundStyle: {},
    textStyle: {}
  ) {
    const inflectionName = selectedTokenSequence.inflected ? selectedTokenSequence.inflectionAnalysisResult.inflectionName : null;
    const inflectionForm = selectedTokenSequence.inflected ? selectedTokenSequence.surfaceForm : null;
    return (
      <Animatable.View
        useNativeDriver
        ref={ref => {this._vocabularyHintView = ref;}}
      >
        <DictionaryHint
          inflectionName={inflectionName}
          inflectionForm={inflectionForm}
          language={'ja'} // TODO review this once new languages are introduced
          dictionaryEntry={vocabularyEntry.dictionaryEntry}
          tokenSequenceOccurrences={vocabularyEntry.tokenSequenceOccurrences}
          backgroundStyle={backgroundStyle}
          textStyle={textStyle}
        />
      </Animatable.View>
    )
  }

  getAudioTrack(): ?AudioTrack {
    if (!(this.state.document && this.state.document.structure.audio_stream_url)) {
      return null;
    }
    const {structure, site_name} = this.state.document;
    const {audio_stream_url, title} = structure;
    return {
      id: audio_stream_url,
      url: audio_stream_url,
      title: title,
      artist: this.state.document.site_name,
      pitchAlgorithm: 'PITCH_ALGORITHM_VOICE',
      // NHK News Easy streams audio through HLS
      // https://react-native-kit.github.io/react-native-track-player/documentation/#track-object
      type: site_name === 'www3.nhk.or.jp_news_easy' ? 'hls' : 'default'
    };
  }

  renderTextBody() {
    return (
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <RichTextPanel
          linkedTexts={this.state.document.analysis.titleAnalysis.linkedText}
          vocabulary={this.state.document.analysis.titleAnalysis.vocabulary}
          isHeader={true}
          limit={1000}
          globalPreferencesStore={this.props.globalPreferencesStore}
          handleWordPress={this.handleWordPress}
          handleLongWordPress={this.handleLongWordPressInTitle}
          tappedEntSeqToCount={this.state.tappedEntSeqToCount}
          selectedVocabularyEntry={this.state.selectedVocabularyEntry}
        />
        <View style={{
          borderTopWidth: 2,
          borderColor: '#c9c9c9',
          marginTop: 15,
          paddingTop: 10,
          paddingLeft: 10,
          paddingRight: 10,
          marginBottom: 20,
          width: Dimensions.get('window').width - 30,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }} />
        <RichTextPanel
          linkedTexts={this.state.document.analysis.bodyAnalysis.linkedText}
          vocabulary={this.state.document.analysis.bodyAnalysis.vocabulary}
          isHeader={false}
          limit={this.state.textLookAheadSize}
          globalPreferencesStore={this.props.globalPreferencesStore}
          handleWordPress={this.handleWordPress}
          handleLongWordPress={this.handleLongWordPressInBody}
          tappedEntSeqToCount={this.state.tappedEntSeqToCount}
          selectedVocabularyEntry={this.state.selectedVocabularyEntry}
        />
      </View>
    );
  }

  renderArticleLoadingIndicator(darkModeEnabled: boolean) {
    const image = darkModeEnabled
      ? require('../../img/Icon-App-1024x1024-dark.png')
      : require('../../img/Icon-App-1024x1024.png');
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Animatable.Image
          style={{height: 100, width: 100, opacity: 0.8}}
          animation='pulse'
          iterationCount='infinite'
          useNativeDriver={true}
          source={image}
        />
      </View>
    )
  }

  renderNavBar(isBookmarked, audioTrack, textColor, backgroundStyle) {
    /*
    if (this.state.scrollViewYPosition === null) {
      return null;
    }*/
    const animatableViewStyle = this.state.scrollViewYPosition
      ? {position: 'absolute', top: this.state.scrollViewYPosition, zIndex: 10}
      : {zIndex: 10};
    return (
      <Animatable.View
        animation={this.state.navBarAnimation}
        duration={500}
        style={[animatableViewStyle, backgroundStyle]}
      >
        <DocumentTextNavBar
          isBookmarked={isBookmarked}
          handleOpenInBrowserPress={this.handleOpenInBrowserPress}
          handleBookmarkPress={this.handleBookmarkPress}
          handleAudioPress={this.handleAudioPress}
          handleDrawerPress={this.handleDrawerPress}
          showAudioButton={!!audioTrack}
          showMenuButton={!!this.state.document}
          textColor={textColor}
        />
        {this.state.showAudioPlayer && !!audioTrack &&
        <Animatable.View animation='fadeIn' duration={400}>
          <AudioPlayerBar
            audioTrack={audioTrack}
            textColor={textColor}
          />
        </Animatable.View>
        }
      </Animatable.View>
    );
  }

  render () {
    const isBookmarked = savedDocumentStore.has(this.props.hit.id, this.props.hit.language);
    const audioTrack = this.getAudioTrack();
    const { darkModeEnabled } = this.props.globalPreferencesStore;
    const backgroundStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textStyle = styleStore.getTextColorStyle(darkModeEnabled);
    const textColor = styleStore.getTextColor(darkModeEnabled);
    return (
      <SafeAreaView
        style={[styles.container, backgroundStyle]}
      >
        <StatusBar
          backgroundColor={darkModeEnabled ? 'black' : 'white'}
          barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
        />
        {
          this.renderNavBar(isBookmarked, audioTrack, textColor, backgroundStyle)
        }
        {
          !this.state.document && this.renderArticleLoadingIndicator(darkModeEnabled)
        }
        {!!this.state.document &&
        <ScrollView
          scrollEventThrottle={200}
          onScroll={this.handleTextScroll}
          onLayout={(event) => this.setState({scrollViewYPosition: event.nativeEvent.layout.y})}
        >
          <View style={{width: Dimensions.get('window').width, height: 50}}/>
          {!!this.state.document.structure.leading_image_url && !this.state.failedToLoadImage &&
          <Animatable.View
            style={{flexDirection: 'row', flexWrap: 'wrap', paddingTop: 5}}
            animation='fadeIn'
            useNativeDriver={true}
          >
            {this.renderLeadingImage(this.state.document.structure.leading_image_url, leadingMediaHeight)}
          </Animatable.View>
          }
          <Animatable.View
            style={{flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 15, paddingTop: 10}}
            animation='fadeIn'
            useNativeDriver={true}
          >
            <View style={{
              paddingLeft: 20,
              paddingRight: 5,
              marginBottom: 30,
              width: Dimensions.get('window').width - 30,
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <Text style={textStyle}>
                { moment(this.state.document.structure.publication_timestamp * 1000)
                  .locale(this.state.document.analysis.bodyAnalysis.language).fromNow() }
              </Text>
              <Text style={[{fontStyle: 'italic'}, textStyle]}>
                { this.state.document.site_name.replace(/_/g, '/') }
              </Text>
            </View>
            {this.renderTextBody()}
          </Animatable.View>
          <View style={{width: Dimensions.get('window').width, height: 50}}/>
        </ScrollView>
        }
        {this.state.selectedVocabularyEntry &&
        this.renderDictionaryHint(
          this.state.selectedVocabularyEntry,
          this.state.selectedTokenSequence,
          backgroundStyle,
          textStyle
        )
        }
      </SafeAreaView>
    );
  }
});

export default documentTextScene;