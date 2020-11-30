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
  Dimensions,
  Platform
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Actions } from 'react-native-router-flux';
import textVocabularyPreferencesStore from '../store/TextVocabularyPreferencesStore';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { observer } from 'mobx-react/native';
import { jaPosCodeDict } from '../store/VocabularyCodes';
import globalPreferencesStore from '../store/GlobalPreferencesStore';
import styleStore from '../store/StyleStore';


export type Props = {
  language: string,
  posList: string[],
  levelList: string[]
}

type State = {
  fadeAnim: Animated.Value,
  closing: boolean
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingTop: Platform.OS === 'android' ? 15 : 35,
    flex: 1,
    borderLeftWidth: 1,
    borderColor: 'lightgray',
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

const VocabularyFilterLightbox = observer(class VocabularyFilterLightbox extends React.Component<Props, State> {

  state = {
    fadeAnim: new Animated.Value(0),
    closing: false
  };

  componentDidMount() {
    Animated.timing(this.state.fadeAnim, {toValue: 1, duration: 250}).start();
  }

  close() {
    this.setState({closing: true});
    Animated.timing(this.state.fadeAnim, {toValue: 0, duration: 250})
      .start(() => Actions.pop());
  }

  renderPosFilterRow(title: string, posRegex: string, textStyle: {}) {
    const {vocabularyPosFilter} = textVocabularyPreferencesStore;
    const size = this.props.posList.filter(pos => `${this.props.language}-${pos}`.match(posRegex)).length;
    let isSelected = false;
    if (title === 'Show All') {
      isSelected = vocabularyPosFilter.length === 0;
    } else {
      isSelected = vocabularyPosFilter.some(pos => pos.match(posRegex));
    }
    return (
      <TouchableOpacity
        style={{
          borderBottomWidth: 1,
          padding: 10,
          borderColor: 'lightgray',
          flexDirection: 'row',
          alignItems: 'center',
          height: 50
        }}
        onPress={() => {
          if (title === 'Show All') {
            if (!isSelected) {
              textVocabularyPreferencesStore.setPosFilter([]);
            }
          } else {
            const matchedCodes = Object.keys(jaPosCodeDict)
              .map(pos => `${this.props.language}-${pos}`)
              .filter(pos => pos.match(posRegex));
            console.log('matchedCodes', matchedCodes);
            let posFilters = JSON.parse(JSON.stringify(textVocabularyPreferencesStore.vocabularyPosFilter));
            if (isSelected) {
              posFilters = posFilters.filter(pos => !matchedCodes.includes(pos));
            } else {
              posFilters = posFilters.concat(matchedCodes);
            }
            textVocabularyPreferencesStore.setPosFilter(posFilters);
          }
        }}
      >
        <MaterialCommunityIcon
          name={isSelected ? 'checkbox-marked-circle-outline' : 'checkbox-blank-circle-outline'}
          style={{
            color: '#829091',
            backgroundColor: 'transparent',
            fontSize: 22,
            marginRight: 10
          }}
        />
        <View style={{justifyContent: 'space-between', flexDirection: 'row', flex: 1}}>
          <Text style={[{fontSize: 22}, textStyle]}>
            {title}
          </Text>
          <Text style={[{fontSize: 16, fontStyle: 'italic'}, textStyle]}>
            {` ${size}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  renderLevelFilterRow(title: string, levelValue: string, textStyle: {}) {
    const {vocabularyLevelFilter} = textVocabularyPreferencesStore;
    const size = title === 'Show All'
      ? this.props.levelList.length
      : this.props.levelList.filter(level => `${this.props.language}-${level.replace('_', '-')}` === levelValue).length;
    let isSelected = false;
    if (title === 'Show All') {
      isSelected = vocabularyLevelFilter.length === 0;
    } else {
      isSelected = vocabularyLevelFilter.some(level => level === levelValue);
    }
    return (
      <TouchableOpacity
        style={{
          borderBottomWidth: 1,
          padding: 10,
          borderColor: 'lightgray',
          flexDirection: 'row',
          alignItems: 'center',
          height: 50
        }}
        onPress={() => {
          if (title === 'Show All') {
            if (!isSelected) {
              textVocabularyPreferencesStore.setLevelFilter([]);
            }
          } else {
            let levelFilters = JSON.parse(JSON.stringify(vocabularyLevelFilter));
            console.log(levelFilters, levelValue);
            if (isSelected) {
              levelFilters = levelFilters.filter(lvl => lvl !== levelValue);
            } else {
              levelFilters.push(levelValue);
            }
            console.log(levelFilters, levelValue);
            textVocabularyPreferencesStore.setLevelFilter(levelFilters);
          }
        }}
      >
        <MaterialCommunityIcon
          name={isSelected ? 'checkbox-marked-circle-outline' : 'checkbox-blank-circle-outline'}
          style={{
            color: '#829091',
            backgroundColor: 'transparent',
            fontSize: 22,
            marginRight: 10
          }}
        />
        <View style={{justifyContent: 'space-between', flexDirection: 'row', flex: 1}}>
          <Text style={[{fontSize: 22}, textStyle]}>
            {title}
          </Text>
          <Text style={[{fontSize: 16, fontStyle: 'italic'}, textStyle]}>
            {` ${size}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render () {
    const { darkModeEnabled } = globalPreferencesStore;
    const backgroundStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textStyle = styleStore.getTextColorStyle(darkModeEnabled);
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
          style={[
            {position: 'absolute', right: 0, width: 240, height: Dimensions.get('window').height},
            backgroundStyle
          ]}
        >
          <TouchableOpacity activeOpacity={1} style={{flex: 1}}>
            <SafeAreaView style={styles.container}>
              <ScrollView>
                <Text
                  style={[
                    {fontWeight: 'bold', fontSize: 18, paddingLeft: 10, paddingBottom: 5},
                    textStyle
                  ]}
                >
                  JLPT Level
                </Text>
                {this.renderLevelFilterRow('Show All', null, textStyle)}
                {this.renderLevelFilterRow('N5', 'ja-JLPT-N5', textStyle)}
                {this.renderLevelFilterRow('N4', 'ja-JLPT-N4', textStyle)}
                {this.renderLevelFilterRow('N3', 'ja-JLPT-N3', textStyle)}
                {this.renderLevelFilterRow('N2', 'ja-JLPT-N2', textStyle)}
                {this.renderLevelFilterRow('N1', 'ja-JLPT-N1', textStyle)}
                {this.renderLevelFilterRow('Other', 'ja-UNKNOWN', textStyle)}
                <Text
                  style={[
                    {fontWeight: 'bold', paddingTop: 20, fontSize: 18, paddingLeft: 10, paddingBottom: 5},
                    textStyle
                  ]}
                >
                  Part of Speech
                </Text>
                {this.renderPosFilterRow('Show All', /^ja-/, textStyle)}
                {this.renderPosFilterRow('Adjectives', /^ja-adj/, textStyle)}
                {this.renderPosFilterRow('Adverbs', /^ja-adv/, textStyle)}
                {this.renderPosFilterRow('Counters', /^ja-crt/, textStyle)}
                {this.renderPosFilterRow('Nouns', /^ja-n/, textStyle)}
                {this.renderPosFilterRow('Particles', /^ja-prt/, textStyle)}
                {this.renderPosFilterRow('Verbs', /^ja-(v|aux)/, textStyle)}
                {this.renderPosFilterRow('Other', /^ja-(conj|exp|id|int|pn|pref|suf)/, textStyle)}
                <View style={{width: 10, height: 60}} />
              </ScrollView>
            </SafeAreaView>
          </TouchableOpacity>
        </Animatable.View>
      </TouchableOpacity>
    );
  }
});

export default VocabularyFilterLightbox;