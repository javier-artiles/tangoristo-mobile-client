/**
 * @flow
 */

import React from 'react';
import { observer } from 'mobx-react/native';
import styleStore from '../store/StyleStore';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar, ScrollView, View,
} from 'react-native';
import externalDocumentService from '../service/ExternalDocumentService';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';
import CustomTextInput from '../component/CustomTextInput';
import CustomTextAnalysisNavBar from '../component/CustomTextAnalysisNavBar';
import isURL from 'validator/lib/isURL';
import type { LinkedText, TextAnalysis, TokenSequence, VocabularyEntry } from '../service/ExternalDocumentService';
import RichTextPanel from '../component/RichTextPanel';
import * as Animatable from 'react-native-animatable';
import DictionaryHint from '../component/DictionaryHint';
import recentlyTappedWordStore from '../store/RecentlyTappedWordStore';
import { speak } from '../util/speech';
import { Actions } from 'react-native-router-flux';
import urlTextContentService from '../service/UrlTextContentService';
import AdBanner from '../component/AdBanner';
import {getSentence} from "../util/text";



type Props = {
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {
  text: string,
  textIsUrl: boolean,
  textAnalysis: ?TextAnalysis,
  textLookAheadSize: number,
  tappedEntSeqToCount: Map<number, number>,
  selectedVocabularyEntry: VocabularyEntry,
  selectedTokenSequence: TokenSequence,
  latestScrollYPosition: number,
  loading: boolean
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  analysisScrollView: {
    paddingTop: 10,
    paddingBottom: 100
  }
});

const CustomTextAnalysisScene = observer(class CustomTextAnalysisScene extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      text: '',
      textIsUrl: false,
      textAnalysis: null,
      textLookAheadSize: 150,
      tappedEntSeqToCount: new Map(),
      selectedVocabularyEntry: null,
      latestScrollYPosition: 0,
      loading: false
    }
  }

  handleTextScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    this.setState({latestScrollYPosition: currentY});
    if (this.isCloseToBottom(event.nativeEvent) && !!this.state.textAnalysis) {
      console.log('isCloseToBottom');
      const increaseSize = 50;
      const textLookAheadSize = Math.min(
        this.state.textLookAheadSize + increaseSize,
        this.state.textAnalysis.linkedText.length
      );
      this.setState({textLookAheadSize})
    }
  };

  isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 100;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  handleDrawerPress = () => {
    Actions.documentTextDrawer({
      vocabulary: this.state.textAnalysis ? this.state.textAnalysis.vocabulary : [],
      language: 'ja',
      documentTitle: 'Custom text analysis vocabulary',
      globalPreferencesStore: this.props.globalPreferencesStore
    });
  };

  handleClearPress = () => {
    if (this.state.textAnalysis) {
      this.setState({
        textAnalysis: null,
        tappedEntSeqToCount: new Map(),
        selectedVocabularyEntry: null
      });
    } else if (this.state.text) {
      this.setState({text: ''});
    }
  };

  handleAnalyzePress = () => {
    this.setState({loading: true});
    externalDocumentService.analyzeText(this.state.text)
      .then(textAnalysis => {
        this.setState({textAnalysis});
      })
      .finally(() => this.setState({loading: false}));
  };

  handleFetchPress = () => {
    this.setState({loading: true});
    urlTextContentService.getTextContent(this.state.text)
      .then((text: string) => this.setState({text, textIsUrl: false}))
      .finally(() => this.setState({loading: false}));
  };

  onChangeText = (text) => {
    const textIsUrl = isURL(text);
    this.setState({text, textIsUrl});
  };

  handleWordPress = async (vocabularyEntry: VocabularyEntry, tokenSequence: TokenSequence, linkedText: LinkedText) => {
    console.log('handleWordPress', vocabularyEntry, tokenSequence, linkedText);

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
    } else if (!!selectedVocabularyEntry &&
        (!this.props.globalPreferencesStore.tapToRevealFuriganaEnabled ||
            (this.props.globalPreferencesStore.tapToRevealFuriganaEnabled && tapCount === 2))
    ) {
      this.setState({ selectedVocabularyEntry, selectedTokenSequence }, () => this._vocabularyHintView.slideInUp(250));
      recentlyTappedWordStore.putDictionaryEntry(selectedVocabularyEntry.dictionaryEntry);
    } else if (this._vocabularyHintView) {
      closingHint = true;
      this._vocabularyHintView.slideOutDown(250).then(() => this.setState({ selectedVocabularyEntry, selectedTokenSequence }));
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

  handleLongWordPressInBody = (vocabularyEntry: VocabularyEntry, tokenSequence: TokenSequence, linkedText: LinkedText) => {
    try {
      const sentence = getSentence(linkedText, this.state.textAnalysis.linkedText);
      this.handleLongWordPress(sentence, vocabularyEntry, tokenSequence, linkedText);
    } catch(error) {
      console.log(error);
    }
  };

  handleLongWordPress = (sentence: string, vocabularyEntry: VocabularyEntry, tokenSequence: TokenSequence, linkedText: LinkedText) => {
    const { text } = this.state;
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
    Actions.wordContextualMenu({sentence, surface, reading, text});
  };

  render() {
    const { darkModeEnabled, textSize, textMarginSize } = this.props.globalPreferencesStore;
    const dynamicContainerStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const backgroundStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textStyle = styleStore.getTextColorStyle(darkModeEnabled);
    const textColor = styleStore.getTextColor(darkModeEnabled);
    return (
      <SafeAreaView
        style={[styles.container, dynamicContainerStyle]}
      >
        <StatusBar
          backgroundColor={darkModeEnabled ? 'black' : 'white'}
          barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
        />
        <CustomTextAnalysisNavBar
          color={textColor}
          hideAnalyzeButton={!this.state.text || this.state.textAnalysis || this.state.loading}
          showFetchButton={this.state.textIsUrl}
          handleDrawerPress={this.handleDrawerPress}
          handleClearPress={this.handleClearPress}
          handleAnalyzePress={this.handleAnalyzePress}
          handleFetchPress={this.handleFetchPress}
        />
        {!this.state.textAnalysis && !this.state.loading &&
        <CustomTextInput
          color={textColor}
          marginTop={10}
          fontSize={textSize}
          padding={textMarginSize}
          placeholderText={'Copy Japanese text or an URL here'}
          defaultValue={this.state.text}
          maxLength={2000}
          onChangeText={this.onChangeText}
        />
        }
        {this.state.textAnalysis &&
          <ScrollView
            style={styles.analysisScrollView}
            scrollEventThrottle={200}
            onScroll={this.handleTextScroll}
            onLayout={(event) => this.setState({scrollViewYPosition: event.nativeEvent.layout.y})}
          >
            <RichTextPanel
              isHeader={false}
              limit={this.state.textLookAheadSize}
              tappedEntSeqToCount={this.state.tappedEntSeqToCount}
              linkedTexts={this.state.textAnalysis.linkedText}
              handleWordPress={this.handleWordPress}
              handleLongWordPress={this.handleLongWordPressInBody}
              vocabulary={this.state.textAnalysis.vocabulary}
              globalPreferencesStore={this.props.globalPreferencesStore}
              tappedEntSeq={this.state.tappedEntSeqToCount}
              selectedVocabularyEntry={this.state.selectedVocabularyEntry}
            />
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
        {
          this.state.loading && this.renderArticleLoadingIndicator(darkModeEnabled)
        }
        <AdBanner />
      </SafeAreaView>
    );
  }
});

export default CustomTextAnalysisScene;