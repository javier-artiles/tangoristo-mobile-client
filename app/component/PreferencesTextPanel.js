/**
 * @flow
 */

import React from 'react';
import { View, Text, Slider, StyleSheet, Dimensions, Switch, Picker } from 'react-native';
import { observer } from 'mobx-react/native';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';


type Props = {
  textColor: string,
  backgroundColor: string,
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 18,
    paddingRight: 35,
    paddingBottom: 10,
    paddingTop: 10
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  text: {
    paddingLeft: 10,
    fontSize: 20
  },
  nestedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10
  },
  nestedRowText: {
    paddingLeft: 10,
    fontSize: 18
  }
});

const preferencesTextPanel = observer(class PreferencesTextPanel extends React.Component<Props, State> {

  renderJlptFuriganaToggles(dynamicTextStyle: {}) {
    return [5, 4, 3, 2, 1].map((level) => {
      const label = `JLPT ${level}`;
      const onValueChange = enable => {
        this.props.globalPreferencesStore.setFuriganaByJlptLevel(level, enable);
      };
      const value = this.props.globalPreferencesStore.furiganaByJlptLevel.includes(level);
      return this.renderSwitch(label, onValueChange, value, dynamicTextStyle);
    })
  }

  renderJlptHighlightToggles(dynamicTextStyle) {
    return [5, 4, 3, 2, 1].map((level) => {
      const label = `JLPT ${level}`;
      const onValueChange = enable => this.props.globalPreferencesStore.setWordHighlightByJlptLevel(level, enable);
      const value = this.props.globalPreferencesStore.wordHighlightByJlptLevel.includes(level);
      return this.renderSwitch(label, onValueChange, value, dynamicTextStyle);
    })
  }

  renderSwitch(label: string, onValueChange, value, dynamicTextStyle) {
    const windowWidth = Dimensions.get('window').width;
    return (
      <View
        key={label}
        style={[styles.nestedRow, {width: windowWidth - 60}]}
      >
        <Text style={[styles.nestedRowText, dynamicTextStyle]}>
          {label}
        </Text>
        <Switch
          onValueChange={onValueChange}
          value={value}
        />
      </View>
    )
  }

  render() {
    const windowWidth = Dimensions.get('window').width;
    const dynamicTextStyle = {color: this.props.textColor};
    return (
      <View style={[styles.container, {backgroundColor: this.props.backgroundColor}]}>
        <View style={styles.row}>
          <Text style={[styles.text, dynamicTextStyle]}>
            Font size
          </Text>
          <Slider
            onValueChange={(value) => {this.props.globalPreferencesStore.setTextSize(value)}}
            value={this.props.globalPreferencesStore.textSize}
            style={{width: windowWidth - 60, marginLeft: 10}}
            style={{width: windowWidth - 60}}
            step={2}
            minimumValue={8}
            maximumValue={40}
          />
        </View>
        <View style={[styles.row, {marginTop: 10}]}>
          <Text style={[styles.text, dynamicTextStyle]}>
            Margin size
          </Text>
          <Slider
            onValueChange={(value) => {this.props.globalPreferencesStore.setTextMarginSize(value)}}
            value={this.props.globalPreferencesStore.textMarginSize}
            style={{width: windowWidth - 60, marginLeft: 10}}
            style={{width: windowWidth - 60}}
            step={2}
            minimumValue={0}
            maximumValue={100}
          />
        </View>
        <View style={[styles.row, {marginTop: 10}]}>
          <Text style={[styles.text, dynamicTextStyle]}>
            Sample text
          </Text>
          <Text
            style={[{
              fontSize: this.props.globalPreferencesStore.textSize,
              marginLeft: this.props.globalPreferencesStore.textMarginSize - 18,
              marginRight: this.props.globalPreferencesStore.textMarginSize - 35,
              marginBottom: 15,
              marginTop: 15,
            }, dynamicTextStyle]}
          >
            先の世にも御契りや深かりけむ、世になく清らなる玉の男御子さへ生まれたまひぬ。いつしかと心もとながらせたまひて、急ぎ参らせて御覧ずるに、めづらかなる稚児の御容貌なり。
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.text, {marginBottom: 10}, dynamicTextStyle]}>
            Furigana mode
          </Text>
          {this.renderJlptFuriganaToggles(dynamicTextStyle)}
          {
            this.renderSwitch(
              'Non JLPT words',
              enable => this.props.globalPreferencesStore.setFuriganaForOutOfJlptWords(enable),
              this.props.globalPreferencesStore.furiganaForOutOfJlptWords,
              dynamicTextStyle
            )
          }
          {
            this.renderSwitch(
              'Tap to reveal furigana',
              enable => this.props.globalPreferencesStore.setTapToRevealFuriganaEnabled(enable),
              this.props.globalPreferencesStore.tapToRevealFuriganaEnabled,
              dynamicTextStyle
            )
          }
        </View>
        <View style={styles.row}>
          <Text style={[styles.text, {marginTop: 10, marginBottom: 10}, dynamicTextStyle]}>
            Word level highlight
          </Text>
          {this.renderJlptHighlightToggles(dynamicTextStyle)}
        </View>
        <View style={styles.row}>
          <Text style={[styles.text, {marginTop: 10, marginBottom: 10}, dynamicTextStyle]}>
            Word highlight type
          </Text>
          {
            this.renderSwitch(
              'Colored underline',
              enable => {
                this.props.globalPreferencesStore.setUnderlineHighlightEnabled(enable);
                this.props.globalPreferencesStore.setColoredTextHighlightEnabled(!enable);
              },
              this.props.globalPreferencesStore.underlineHighlightEnabled,
              dynamicTextStyle
            )
          }
          {
            this.renderSwitch(
              'Colored text',
              enable => {
                this.props.globalPreferencesStore.setColoredTextHighlightEnabled(enable);
                this.props.globalPreferencesStore.setUnderlineHighlightEnabled(!enable);
              },
              this.props.globalPreferencesStore.coloredTextHighlightEnabled,
              dynamicTextStyle
            )
          }
        </View>
        <View style={styles.row}>
          <Text style={[styles.text, {marginTop: 10, marginBottom: 10}, dynamicTextStyle]}>
            Word to speech
          </Text>
          {
            this.renderSwitch(
              'Pronounce word on tap',
              enable => this.props.globalPreferencesStore.setPronounceWordOnTap(enable),
              this.props.globalPreferencesStore.pronounceWordOnTap,
              dynamicTextStyle
            )
          }
        </View>
      </View>
    )
  }
});

export default preferencesTextPanel;
