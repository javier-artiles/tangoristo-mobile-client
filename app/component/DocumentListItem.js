/**
 * @flow
 */

import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { observer } from 'mobx-react/native';
import type { Hit, TitleToken } from '../service/ExternalDocumentService';
import externalDocumentService from '../service/ExternalDocumentService';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'react-native-animatable';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';
import { vocabularyLevelColorPalette } from '../configuration/Configuration';
import savedDocumentStore from '../store/SavedDocumentStore';
import recentlyTappedHitStore from '../store/RecentlyTappedHitStore';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';
import styleStore from '../store/StyleStore';
import RichText from './RichText';

type Props = {
  hit: Hit,
  showSiteName: boolean,
  showCategory: boolean,
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {
  failedToLoadImage: boolean,
  isBookmarking: boolean
}

const marginRight = 10;
const marginLeft = 10;
const thumbnailWidth = 100;
const thumbnailMarginRight = 10;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginRight,
    marginLeft,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 20 : 16
  },
  siteName: {
    fontSize: 13,
    marginBottom: 4
  },
  category: {
    fontSize: 13,
    marginBottom: 4
  },
  publication: {
    marginTop: 4,
    fontSize: 13
  },
  thumbnail: {
    borderRadius: 5,
    marginRight: thumbnailMarginRight,
    width: thumbnailWidth,
    height: 70
  }
});


const DocumentListItem = observer(class DocumentListItem extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      failedToLoadImage: false,
      isBookmarking: false
    };
  }

  getVocabularyLevelBar(width: number, height: number, opacity: number) {
    const sum = Object.values(this.props.hit.vocabularyLevelToFrequency).reduce((a, b) => a + b, 0);
    return Object.keys(this.props.hit.vocabularyLevelToFrequency).sort()
      .map((levelName: string, index: number) => {
        const frequency = this.props.hit.vocabularyLevelToFrequency[levelName];
        const percentage = frequency / sum;
        return (
          <View
            key={levelName}
            style={{
              width: width * percentage,
              height: height,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: opacity,
              backgroundColor: vocabularyLevelColorPalette[index],
              borderRadius: height,
              marginLeft: 2
            }}
          >
            {percentage > 0.1 &&
            <Text style={{fontSize: 8}}>
              {index + 1}
            </Text>
            }
          </View>
        )
      });
  }

  handleLongPress(isBookmarked: boolean) {
    if (isBookmarked) {
      console.log('removing document bookmark');
      savedDocumentStore.remove(this.props.hit.id, this.props.hit.language);
      this.forceUpdate();
    } else {
      console.log('saving document bookmark');
      this.setState({isBookmarking: true});
      externalDocumentService.getDocument(this.props.hit.id)
        .then((document) => {
          console.log('document', document);
          savedDocumentStore.put(this.props.hit, document, this.props.hit.language);
          this.setState({isBookmarking: false});
        })
        .catch((error) => {
          console.warn('failed to fetch document for bookmark', error);
          this.setState({isBookmarking: false});
        });
    }
  }

  renderTextComponents(
    titleTokens: TitleToken[],
    mainTextSizePreference: number,
    textColor: string
  ) {
    const {
      wordHighlightByJlptLevel,
      furiganaByJlptLevel,
      furiganaForOutOfJlptWords,
      coloredTextHighlightEnabled,
      underlineHighlightEnabled,
      jlptLevelColors
    } = this.props.globalPreferencesStore;
    return titleTokens
      .map((titleToken: TitleToken, index: number) => {
        const officialProficiencyLevelString = titleToken.official_proficiency_level;
        const readingList = titleToken.reading_list;
        const surfaceList = titleToken.surface_list;
        const officialProficiencyLevel = officialProficiencyLevelString && officialProficiencyLevelString.startsWith('JLPT_N')
          ? parseInt(officialProficiencyLevelString.replace('JLPT_N', ''))
          : null;
        const highlightIsEnabled = officialProficiencyLevel !== null && wordHighlightByJlptLevel.includes(officialProficiencyLevel);
        const mainTextColor = highlightIsEnabled && coloredTextHighlightEnabled
          ? jlptLevelColors[officialProficiencyLevel - 1]
          : textColor;
        const underlineColor = highlightIsEnabled && underlineHighlightEnabled
          ? jlptLevelColors[officialProficiencyLevel - 1]
          : null;
        const furiganaEnabled = furiganaByJlptLevel.includes(officialProficiencyLevel) || furiganaForOutOfJlptWords;

        return (
          <RichText
            key={index}
            topText={furiganaEnabled ? readingList : []}
            topTextSize={12}
            topTextColor={textColor}
            topTextBold={false}
            mainText={surfaceList}
            mainTextSize={Platform.OS === 'ios' ? 20 : 18}
            mainTextColor={mainTextColor}
            mainTextBold={false}
            underlineColor={underlineColor}
            marginBottom={0}
            paddingBottom={5}
          />
        )
      });
  }

  render () {
    const textColorStyle = styleStore.getTextColorStyle(this.props.globalPreferencesStore.darkModeEnabled);
    const isBookmarked = savedDocumentStore.has(this.props.hit.id, this.props.hit.language);
    const showImage = this.props.hit.thumbnailUrl && !this.state.failedToLoadImage;
    const titleWidth = showImage
      ? Dimensions.get('window').width - (marginLeft + marginRight + thumbnailWidth + thumbnailMarginRight)
      : Dimensions.get('window').width - (marginLeft + marginRight);
    const publicationDateString = moment(this.props.hit.publication + " +0000", "YYYY-MM-DD HH:mm:ss Z").fromNow();
    const { titleTokens } = this.props.hit;
    const {showFuriganaListOnTitle} = this.props.globalPreferencesStore;
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          recentlyTappedHitStore.putHit(this.props.hit);
          Actions.documentText({articleKey: this.props.hit.id, hit: this.props.hit});
        }}
        onLongPress={() => this.handleLongPress(isBookmarked)}
      >
        {showImage &&
        <Image
          source={{uri: this.props.hit.thumbnailUrl}}
          style={styles.thumbnail}
          onError={(error) => this.setState({failedToLoadImage: true})}
          />
        }
        <View>
          <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between'}}>
            {this.props.showSiteName &&
            <Text style={[styles.siteName, textColorStyle]}>
              {this.props.hit.siteName.replace(/www[0-9]?\./, '').replace(/_/g, '/')}
            </Text>
            }
            {this.props.showCategory &&
            <Text style={[styles.category, textColorStyle]}>
              {this.props.hit.category}
            </Text>
            }
          </View>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              width: Dimensions.get('window').width - (showImage ? 130 : 20)
            }}
          >
            {showFuriganaListOnTitle &&
            this.renderTextComponents(titleTokens, styles.title.fontSize, textColorStyle.color)
            }
            {!showFuriganaListOnTitle &&
            <Text
                style={[styles.title, {width: titleWidth, height: 50}, textColorStyle]}
                numberOfLines={2}
            >
              {this.props.hit.title}
            </Text>
            }
          </View>
          <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
              <Text style={[styles.publication, textColorStyle]}>
                {publicationDateString}
              </Text>
              {this.state.isBookmarking &&
                <Text style={{marginLeft: 10, color: '#f39c12'}}>
                  saving
                </Text>
              }
              {isBookmarked &&
              <MaterialCommunityIcon
                name={'bookmark'}
                style={{
                  marginLeft: 8,
                  color: '#7f8c8d',
                  fontSize: 14
                }}
              />
              }
            </View>
            <View style={{marginTop: 4, flexDirection: 'row', alignItems: 'center'}}>
              {this.getVocabularyLevelBar(100, 12, 0.6)}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
});

export default DocumentListItem;
