/**
 * @flow
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';


type Props = {
  text: string,
  color: string,
  fontSize: number,
  height: number,
  horizontalPadding: number,
  onPress: () => {}
}

type State = {
}

const styles = StyleSheet.create({
  container: {
  }
});

export default class Button extends React.Component<Props, State> {
  render() {
    const {horizontalPadding, height, text, color, fontSize, onPress} = this.props;
    return (
      <TouchableOpacity
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: '#f0f0f0',
          borderRadius: height / 4,
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
          marginLeft: 5,
          marginRight: 10,
          height
        }}
        onPress={onPress}
      >
        <Text style={{fontSize, color}}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
}