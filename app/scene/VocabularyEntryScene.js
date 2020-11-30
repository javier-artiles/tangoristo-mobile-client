/**
 * @flow
 */


import React from "react";
import {StyleSheet, SafeAreaView, View, Text, TouchableOpacity, Dimensions, ScrollView, Clipboard} from 'react-native';
import type { DictionaryEntry, Kele, Rele, Sense, TokenSequence } from '../service/ExternalDocumentService';
import { observer } from 'mobx-react/native';
import { Actions } from 'react-native-router-flux';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import savedDictionaryEntryStore from '../store/SavedVocabularyStore';
import { jaMiscCodeDict, jaPosCodeDict } from '../store/VocabularyCodes';
import { vocabularyLevelColorPalette } from '../configuration/Configuration';
import globalPreferencesStore from '../store/GlobalPreferencesStore';
import styleStore from '../store/StyleStore';
import Accordion from 'react-native-collapsible/Accordion';
import PreferencesSectionHeader from '../component/PreferencesSectionHeader';
import textVocabularyPreferencesStore from '../store/TextVocabularyPreferencesStore';
import AdBanner from '../component/AdBanner';
import {speak} from "../util/speech";
import tsvExportService from "../service/TsvExportService";
import MessageToast from "../component/MessageToast";

const ISO6391 = require('iso-639-1');
const Color = require('color');
const _ = require('lodash');


type Props = {
  dictionaryEntry: DictionaryEntry,
  tokenSequenceOccurrences: ?TokenSequence[]
}

type State = {
  toastMessage: ?string
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  tagContainer: {
    borderRadius: 10,
    borderTopLeftRadius: 0,
    padding: 4,
    margin: 4,
    paddingLeft: 8,
    paddingBottom: 8,
    marginBottom: 8,
    marginTop: 5,
    marginLeft: 26,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#f0f0f0'
  }
});


const VocabularyEntryScene = observer(class VocabularyEntryScene extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      toastMessage: null
    }
  }

  handleBookmarkPress = () => {
    console.log('handleBookmarkPress');
    const isBookmarked = savedDictionaryEntryStore.has(this.props.dictionaryEntry.entSeq, this.props.language);
    let toastMessage = null;
    if (isBookmarked) {
      savedDictionaryEntryStore.remove(this.props.dictionaryEntry.entSeq, this.props.language);
      toastMessage = 'Removed from bookmarks';
    } else {
      savedDictionaryEntryStore.put(this.props.dictionaryEntry, this.props.language);
      toastMessage = 'Added to bookmarks';
    }
    this.setState({toastMessage});
  };

  renderPos(pos: string[]) {
    return pos
      .map(p => p.replace('_', '-'))
      .filter(p => Object.keys(jaPosCodeDict).includes(p))
      .map(p => {
        return (
          <View key={p}>
            <Text style={{fontSize: 14, color: 'grey'}}>
              <Text style={{fontWeight: 'bold'}}>
                {`${p}: `}
              </Text>
              {jaPosCodeDict[p]}
            </Text>
          </View>
        );
      });
  }

  renderMiscCodes(miscCodes: string[]) {
    return miscCodes
      .map(p => p.replace('_', '-'))
      .filter(p => Object.keys(jaMiscCodeDict).includes(p))
      .map(p => {
        return (
          <View key={p}>
            <Text style={{fontSize: 14, color: 'grey'}}>
              <Text style={{fontWeight: 'bold'}}>
                {`${p}: `}
              </Text>
              {jaMiscCodeDict[p]}
            </Text>
          </View>
        );
      });
  }

  getGlossByLanguage(sense: Sense, language: string) {
    return sense.gloss.filter(gloss => gloss.lang === language).map(gloss => gloss.text).join('; ');
  }

  renderSenseList(senseList: Sense[], language: string, textStyle: {}) {
    return senseList
      .filter(sense => sense.gloss.filter(gloss => gloss.lang === language).length > 0)
      .map((sense, index) => {
        const gloss = this.getGlossByLanguage(sense, language);
        return (
          <View key={index}>
            <View style={{flexDirection: 'row'}}>
              <View style={{marginTop: 4, height: 20, width: 20, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightgrey'}}>
                <Text style={{color: Color(textStyle.color).negate(), fontWeight: 'bold'}}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[{fontSize: 20, marginLeft: 8}, textStyle]}>
                {gloss}
              </Text>
            </View>
            {sense.pos.length > 0 &&
            <View style={styles.tagContainer}>
              {this.renderPos(sense.pos)}
            </View>
            }
            {sense.misc.length > 0 &&
            <View style={styles.tagContainer}>
              {this.renderMiscCodes(sense.misc)}
            </View>
            }
          </View>
        );
      })
  }

  isCommon(dictionaryEntry: DictionaryEntry): boolean {
    return dictionaryEntry.keleList.filter((kele: Kele) => kele.kePri.length > 0).length > 0
      || dictionaryEntry.releList.filter((rele: Rele) => rele.rePri.length > 0).length > 0
  }

  renderLevelTag(officialProficiencyLevel: string) {
    return (
      <View style={{
        backgroundColor: vocabularyLevelColorPalette[Number.parseInt(officialProficiencyLevel.replace('JLPT_N', '')) - 1],
        borderRadius: 10,
        padding: 3,
        paddingLeft: 7,
        paddingRight: 7,
        height: 20
      }}>
        <Text style={{fontSize: 11, fontWeight: 'bold', color: 'white'}}>
          {officialProficiencyLevel.replace('_', ' ')}
        </Text>
      </View>
    );
  };

  renderCommonTag() {
    return (
      <View style={{
        backgroundColor: 'grey',
        borderRadius: 10,
        padding: 3,
        paddingLeft: 7,
        paddingRight: 7,
        height: 20
      }}>
        <Text style={{fontSize: 11, fontWeight: 'bold', color: 'white'}}>
          common
        </Text>
      </View>
    );
  }

  renderInflectedOccurrences(
    inflectedTokenSequences: TokenSequence[],
    dictionaryForm: string,
    textStyle: {}
  ) {
    return _.uniqBy(inflectedTokenSequences, 'inflectionAnalysisResult.inflectionName').map((ts: TokenSequence, index: number) => {
      return (
        <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={[{fontSize: 20}, textStyle]}>
            <Text>
              {dictionaryForm.replace(ts.inflectionAnalysisResult.inflectionBase, '')}
            </Text>
            <Text style={{color: 'crimson'}}>
              {ts.inflectionAnalysisResult.inflectionForm}
            </Text>
          </Text>
          <Text style={[{fontSize: 16}, textStyle]}>
            {ts.inflectionAnalysisResult.inflectionName}
          </Text>
        </View>
      )
    });
  }

  renderSenseAccordion(senseList: Sense[], extraLanguages: string[], textStyle: {}) {
    const sections = extraLanguages
      .filter((languageCode: string) => {
        return senseList.filter(sense => sense.gloss.filter(gloss => gloss.lang === languageCode).length > 0).length > 0;
      })
      .map((languageCode: string, index: number) => {
        const languageLabel = this.capitalizeFirstLetter(ISO6391.getNativeName(languageCode));
        return {
            index: index,
            title: languageLabel,
            languageCode: languageCode,
            content: (
              <View>
                {this.renderSenseList(senseList, languageCode, textStyle)}
              </View>
            )
          };
      });

    const activeSections = textVocabularyPreferencesStore.activeExtraDefinitionLanguagePanels
      .filter(languageCode => {
        const section = sections.filter(sec => sec.languageCode === languageCode);
        return section.length > 0 && section[0];
      })
      .map(languageCode => {
        return sections.filter(sec => sec.languageCode === languageCode)[0].index;
      });

    return (
      <Accordion
        sections={sections}
        expandMultiple
        underlayColor='transparent'
        sectionContainerStyle={{marginTop: 15}}
        activeSections={activeSections}
        renderHeader={section => this._renderHeader(section, textStyle.color)}
        renderContent={section => section.content}
        onChange={(activeSections: string) => {
          const activeLanguageCodes = activeSections.map(sectionIndex => sections[sectionIndex].languageCode);
          textVocabularyPreferencesStore.setActiveExtraDefinitionLanguagePanels(activeLanguageCodes)
        }}
      />
    );
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  _renderHeader = (section, textColor) => {
    return (
      <View style={{paddingLeft: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}>
        <PreferencesSectionHeader
          fontSize={18}
          title={section.title}
          isFolded={!textVocabularyPreferencesStore.activeExtraDefinitionLanguagePanels.includes(section.languageCode)}
          textColor={textColor}
          paddingTop={10}
          paddingBottom={10}
          paddingLeft={0}
        />
      </View>
    );
  };


  render () {
    const {dictionaryForm, alternateForm, senseList, entSeq, officialProficiencyLevel} = this.props.dictionaryEntry;
    const isCommon = this.isCommon(this.props.dictionaryEntry);
    const isBookmarked = savedDictionaryEntryStore.has(entSeq, this.props.language);
    const inflectedOccurrences = (!this.props.tokenSequenceOccurrences ? [] : this.props.tokenSequenceOccurrences).filter(ts => ts.inflected);
    const showTags = officialProficiencyLevel !== 'UNKNOWN' || isCommon;
    const { darkModeEnabled } = globalPreferencesStore;
    const backgroundStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textStyle = styleStore.getTextColorStyle(darkModeEnabled);
    const {extraDefinitionLanguages: extraLanguages} = globalPreferencesStore;
    return (
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <View
          style={{
            height: 50,
            width: Dimensions.get('window').width - 10,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#bdc3c7',
            borderColor: 'lightgray',
            marginLeft: 5,
            marginRight: 5
          }}
        >
          <TouchableOpacity
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => {
              Actions.pop();
            }}
          >
            <MaterialCommunityIcon
              name={'chevron-left'}
              style={[{
                marginLeft: 8,
                marginTop: 5,
                fontSize: 38
              }, textStyle]}
            />
          </TouchableOpacity>
          <View
            style={{flexDirection: 'row'}}
          >
            <TouchableOpacity
              style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
              onPress={() => {
                const vocabularyTsv = tsvExportService.exportDictionaryEntry(this.props.dictionaryEntry);
                Clipboard.setString(vocabularyTsv);
                this.setState({toastMessage: 'Copied entry to clipboard'});
              }}
            >
              <MaterialCommunityIcon
                name={'content-copy'}
                style={[{
                  marginRight: 8,
                  marginTop: 3,
                  fontSize: 24
                }, textStyle]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
              onPress={this.handleBookmarkPress}
            >
              <MaterialCommunityIcon
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                style={[{
                  marginRight: 8,
                  marginTop: 5,
                  fontSize: 30
                }, textStyle]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => speak(dictionaryForm)}
            >
              <MaterialCommunityIcon
                name={'volume-high'}
                style={[{
                  marginRight: 8,
                  marginTop: 13,
                  fontSize: 25,
                }, textStyle]}
              />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView>
          <View style={{padding: 20}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text
                style={[{
                  fontSize: 30,
                  marginBottom: 20,
                  width: Dimensions.get('window').width - 40 - (showTags ? 80 : 0)
                }, textStyle]}
              >
                {dictionaryForm}
                {!!alternateForm &&
                <Text
                  style={{color: 'darkred'}}
                >
                  {`【${alternateForm}】`}
                </Text>
                }
              </Text>
              {showTags &&
              <View style={{
                flexDirection: 'column',
                height: 45,
                justifyContent: 'space-between',
                opacity: 0.7
              }}>
                {officialProficiencyLevel !== 'UNKNOWN' &&
                this.renderLevelTag(officialProficiencyLevel)
                }
                {isCommon &&
                this.renderCommonTag()
                }
              </View>
              }
            </View>
            {inflectedOccurrences && inflectedOccurrences.length > 0 &&
            <View style={{padding: 10, paddingLeft: 0, marginTop: 15, marginBottom: 20}}>
              <View style={{borderBottomWidth: 1, marginBottom: 10, paddingBottom: 5}}>
                <Text style={[{fontSize: 18, fontStyle: 'italic'}, textStyle]}>
                  Inflections found in the text
                </Text>
              </View>
              {this.renderInflectedOccurrences(inflectedOccurrences, dictionaryForm, textStyle)}
            </View>
            }
            <View style={{borderBottomWidth: 1, marginBottom: 10, paddingBottom: 5}}>
              <Text style={[{fontSize: 18, fontStyle: 'italic'}, textStyle]}>
                Definitions
              </Text>
            </View>
            {this.renderSenseList(senseList, 'en', textStyle)}
            {extraLanguages.length > 0 && this.renderSenseAccordion(senseList, extraLanguages, textStyle)}
          </View>
        </ScrollView>
        {this.state.toastMessage &&
        <MessageToast
          text={this.state.toastMessage}
          color='black'
          backgroundColor='#F9E8B8'
          borderWidth={2}
          borderColor='#EFBA60'
          fadeOutInMillis={2000}
        />
        }
        <AdBanner/>
      </SafeAreaView>
    )
  }
});

export default VocabularyEntryScene;
