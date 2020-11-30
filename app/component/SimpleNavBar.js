/**
 * @flow
 */

import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Actions } from 'react-native-router-flux';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  title: string,
  textColor: string,
  backgroundColor: string
}

type State = {}

export default class SimpleNavBar extends React.Component<Props, State> {
  static defaultProps = {
    backgroundColor: 'transparent'
  };

  render() {
    return (
      <View style={{
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: Dimensions.get('window').width,
        backgroundColor: this.props.backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: '#bdc3c7',
        borderColor: 'lightgray'
      }}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 10
          }}
          onPress={() => Actions.pop()}
        >
          <MaterialCommunityIcon
            name={'chevron-left'}
            style={{
              marginTop: 3,
              fontSize: 38,
              color: this.props.textColor
            }}
          />
        </TouchableOpacity>
        <Text style={{fontSize: 20, color: this.props.textColor}}>
          {this.props.title}
        </Text>
      </View>
    );
  }
}