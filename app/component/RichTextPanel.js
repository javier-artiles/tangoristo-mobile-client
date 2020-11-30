/**
 * @flow
 */

import type { LinkedText, TokenSequence, VocabularyEntry } from '../service/ExternalDocumentService';
import RichText from './RichText';
import { Image, StyleSheet, View, Dimensions } from 'react-native';
import React from 'react';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';
import { observer } from 'mobx-react/native';
import styleStore from '../store/StyleStore';

const textLoading = require('../../img/text-loading.gif');

type Props = {
  linkedTexts: LinkedText[],
  vocabulary: VocabularyEntry[],
  isHeader: boolean,
  limit: number,
  globalPreferencesStore: GlobalPreferencesStore,
  handleWordPress: (
    vocabularyEntry: VocabularyEntry,
    tokenSequence: TokenSequence,
    linkedText: LinkedText
  ) => void,
  handleLongWordPress: (
    vocabularyEntry: VocabularyEntry,
    tokenSequence: TokenSequence,
    linkedText: LinkedText
  ) => void,
  tappedEntSeqToCount: Map<number, number>,
  selectedVocabularyEntry: VocabularyEntry
}

type State = {}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  }
});

const richTextPanel = observer(class RichTextPanel extends React.Component<Props, State> {
  renderTextComponents(
    linkedTexts: LinkedText[],
    vocabulary: VocabularyEntry[],
    isHeader: boolean,
    textColor: string,
    limit: number = 0
  ) {
    const {
      wordHighlightByJlptLevel,
      furiganaByJlptLevel,
      furiganaForOutOfJlptWords,
      coloredTextHighlightEnabled,
      underlineHighlightEnabled,
      jlptLevelColors,
      tapToRevealFuriganaEnabled,
      textSize
    } = this.props.globalPreferencesStore;
    const topTextSizeRatio = 0.5;
    const topTextSizePreference = textSize * topTextSizeRatio;
    const headerSizeRatio = 1.2;
    const topTextSize = isHeader ? topTextSizePreference * headerSizeRatio : topTextSizePreference;
    const mainTextSize = isHeader ? textSize * headerSizeRatio : textSize;
    const components = linkedTexts
      .slice(0, limit === 0 ? linkedTexts.length : limit)
      .map((linkedText: LinkedText, index: number) => {
        const vocabularyEntry = vocabulary[linkedText.vocabularyIndex];
        const officialProficiencyLevelString = vocabularyEntry && vocabularyEntry.dictionaryEntry
          ? vocabularyEntry.dictionaryEntry.officialProficiencyLevel
          : null;
        const officialProficiencyLevel = officialProficiencyLevelString && officialProficiencyLevelString.startsWith('JLPT_N')
          ? parseInt(officialProficiencyLevelString.replace('JLPT_N', ''))
          : null;
        const shouldHighlightByLevel = officialProficiencyLevel !== null && wordHighlightByJlptLevel.includes(officialProficiencyLevel);
        const mainTextColor = shouldHighlightByLevel && coloredTextHighlightEnabled
            ? jlptLevelColors[officialProficiencyLevel - 1]
            : textColor;
        let underlineColor = null;
        if (underlineHighlightEnabled) {
          underlineColor = shouldHighlightByLevel
            ? jlptLevelColors[officialProficiencyLevel - 1]
            : 'transparent';
        }
        const tapCount = vocabularyEntry && vocabularyEntry.dictionaryEntry
            ? this.props.tappedEntSeqToCount.get(vocabularyEntry.dictionaryEntry.entSeq)
            : 0;
        const furiganaEnabled =  vocabularyEntry && vocabularyEntry.dictionaryEntry &&
            ((tapToRevealFuriganaEnabled && tapCount > 0)
                || furiganaByJlptLevel.includes(officialProficiencyLevel)
                || (!officialProficiencyLevel && furiganaForOutOfJlptWords));
        const tokenSequence = vocabularyEntry ? vocabularyEntry.tokenSequenceOccurrences[linkedText.sequenceIndex] : null;
        const isSelectedDictionaryEntry = this.props.selectedVocabularyEntry && vocabularyEntry && vocabularyEntry.dictionaryEntry
          && this.props.selectedVocabularyEntry.dictionaryEntry.entSeq === vocabularyEntry.dictionaryEntry.entSeq;

        const subComponents = [];

        if (linkedText.surfaceList
          && linkedText.surfaceList.length >= 1
          && linkedText.surfaceList[0].startsWith('\n')) {
          subComponents.push(
            <View
              key={`nl_${index}`}
              style={{
                height: this.props.globalPreferencesStore.textSize * .7,
                width: Dimensions.get('window').width - (this.props.globalPreferencesStore.textMarginSize * 2)
              }}
            />
          );
        }

        subComponents.push(
          <RichText
            onPress={() => this.props.handleWordPress(vocabularyEntry, tokenSequence, linkedText)}
            onLongPress={() => this.props.handleLongWordPress(vocabularyEntry, tokenSequence, linkedText)}
            key={index}
            topText={furiganaEnabled ? linkedText.readingList : []}
            topTextSize={topTextSize}
            topTextColor={textColor}
            topTextBold={isHeader}
            mainText={linkedText.surfaceList}
            mainTextSize={mainTextSize}
            mainTextColor={mainTextColor}
            mainTextBold={isSelectedDictionaryEntry}
            underlineColor={underlineColor}
          />
        );

        return subComponents;
      });
    if (!isHeader && limit < linkedTexts.length) {
      components.push(
        <Image
          key='text-loading-indicator'
          source={textLoading}
          style={{width: 40, height: 40}}
        />
      )
    }
    return components;
  }

  render() {
    const {
      linkedTexts,
      vocabulary,
      isHeader,
      limit
    } = this.props;
    const {
      textMarginSize: textMargin,
      darkModeEnabled
    } = this.props.globalPreferencesStore;
    const textColor = styleStore.getTextColor(darkModeEnabled);
    const dynamicContainerStyle = {
      marginLeft: textMargin,
      marginRight: textMargin
    };
    return (
      <View
        style={[styles.container, dynamicContainerStyle]}
      >
        {this.renderTextComponents(
          linkedTexts,
          vocabulary,
          isHeader,
          textColor,
          limit)
        }
      </View>
    )
  }
});

export default richTextPanel;