/**
 * @flow
 */

import React from 'react';
import { TouchableOpacity, Text, View, Dimensions, StyleSheet } from 'react-native';

type Props = {
  topText: string[],
  topTextSize: number,
  topTextColor: string,
  topTextBold: boolean,
  mainText: string[],
  mainTextSize: number,
  mainTextColor: string,
  mainTextBold: boolean,
  underlineColor: string,
  paddingBottom: number,
  marginBottom: number,
  onPress: () => void,
  onLongPress: () => void
}

type State = {}

const styles = StyleSheet.create({
  token: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  newline: {
    flexDirection: 'column',
    alignItems: 'center'
  }
});

export default class RichText extends React.Component<Props, State> {
  static defaultProps = {
    paddingBottom: 10,
    marginBottom: 5,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !RichText.arraysEqual(this.props.topText, nextProps.topText)
      || !RichText.arraysEqual(this.props.mainText, nextProps.mainText)
      || this.props.mainTextSize !== nextProps.mainTextSize
      || this.props.mainTextColor !== nextProps.mainTextColor
      || this.props.mainTextBold !== nextProps.mainTextBold
  }

  static arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
      return false;
    for(let i = arr1.length; i--;) {
      if(arr1[i] !== arr2[i])
        return false;
    }
    return true;
  }

  renderTextTokens() {
    return this.props.mainText.map((mainToken: string, index: number) => {
      const topToken = this.props.topText[index];
      if (mainToken === '\n') {
        return this.renderNewline(index);
      } else {
        return this.renderToken(mainToken.trim(), topToken, index);
      }
    })
  }

  renderNewline(index: number) {
    return (
      <View
        key={index}
        style={[styles.newline, {width: Dimensions.get('window').width}]}
      />
    )
  }

  renderToken(mainToken: string, topToken: string, key: string) {
    const tokenTopTextStyle = {
      fontSize: this.props.topTextSize,
      color: this.props.topTextColor,
      fontWeight: this.props.topTextBold ? 'bold' : 'normal'
    };
    const tokenMainTextStyle = {
      fontSize: this.props.mainTextSize,
      color: this.props.mainTextColor,
      fontWeight: this.props.mainTextBold ? 'bold' : 'normal'
    };

    return (
      <View
        key={key}
        style={[styles.token]}
      >
        <Text
          style={tokenTopTextStyle}
        >
          {topToken ? topToken : '　'}
        </Text>
        <Text
          style={tokenMainTextStyle}
        >
          {mainToken.replace('\n', '').trim()}
        </Text>
      </View>
    );
  }

  render() {
    const dynamicStyle = this.props.underlineColor
      ? {borderBottomWidth: 2, borderBottomColor: this.props.underlineColor, paddingBottom: this.props.paddingBottom * 0.5, marginBottom: 8}
      : {};
    if (this.props.onPress) {
      return (
        <TouchableOpacity
          style={[{flexDirection: 'row', paddingBottom: this.props.paddingBottom}, dynamicStyle]}
          onPress={this.props.onPress}
          onLongPress={this.props.onLongPress}
        >
          {this.renderTextTokens()}
        </TouchableOpacity>
      )
    } else {
      return (
        <View
          style={[{flexDirection: 'row', paddingBottom: this.props.paddingBottom}, dynamicStyle]}
        >
          {this.renderTextTokens()}
        </View>
      )
    }

  }
}