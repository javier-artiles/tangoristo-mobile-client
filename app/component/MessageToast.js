/**
 * @flow
 */

import React from 'react';
import { Dimensions, StyleSheet, View, Platform } from 'react-native';
import { Text } from 'react-native-animatable';
import * as Animatable from 'react-native-animatable';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  messageBox: {
    alignItems: 'center',
    borderRadius: 15,
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    minWidth: 100
  }
});

type Props = {
  top: number,
  text: string,
  textColor: string,
  borderWidth: number,
  borderColor: string,
  backgroundColor: string,
  fadeOutInMillis: number
}

export default class MessageToast extends React.Component<Props, State> {
  static defaultProps = {
    fadeOutInMillis: 0,
    borderWidth: 0,
    borderColor: 'black',
    top: Platform.OS === 'ios' ? 100 : 60
  };
  render () {
    return (
      <Animatable.View
        style={[styles.container, {top: this.props.top}]}
        delay={this.props.fadeOutInMillis}
        duration={500}
        animation={this.props.fadeOutInMillis > 0 ? 'fadeOut' : null}
      >
        <View style={[styles.messageBox,
          {
            backgroundColor: this.props.backgroundColor,
            borderWidth: this.props.borderWidth,
            borderColor: this.props.borderColor
          }
          ]}>
          <Text style={{color: this.props.color, fontWeight: 'bold'}}>
            {this.props.text}
          </Text>
        </View>
      </Animatable.View>
    );
  }
}