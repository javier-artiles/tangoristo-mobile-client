/**
 * @flow
 */

import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View, Text, Linking } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Actions } from 'react-native-router-flux';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
    width: Dimensions.get('window').width - 10,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    borderColor: 'lightgray',
    marginLeft: 5,
    marginRight: 5
  }
});

type Props = {
  handleOpenInBrowserPress: () => void,
  handleBookmarkPress: () => void,
  handleAudioPress: () => void,
  handleDrawerPress: () => void,
  showAudioButton: boolean,
  showMenuButton: boolean,
  isBookmarked: boolean,
  textColor: string
}

type State = {
  audioPlayerToggle: boolean
}

export default class DocumentTextNavBar extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      audioPlayerToggle: false
    }
  }

  render() {
    const buttonWidth = Dimensions.get('window').width < 350 ? 45 : 50;
    const textColorStyle = {color: this.props.textColor};
    return (
      <View style={styles.container}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity
            style={{width: buttonWidth, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => Actions.pop()}
          >
            <MaterialCommunityIcon
              name={'chevron-left'}
              style={[{
                marginTop: 5,
                fontSize: 40,
              }, textColorStyle]}
            />
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', paddingRight: 10}}>
          {this.props.showAudioButton &&
          <TouchableOpacity
            style={{width: buttonWidth, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => {
              this.props.handleAudioPress();
              this.setState({audioPlayerToggle: !this.state.audioPlayerToggle});
            }}
          >
            <MaterialCommunityIcon
              name={this.state.audioPlayerToggle ? 'close-circle-outline' :'play-circle-outline'}
              style={[{
                fontSize: 30,
                color: this.state.audioPlayerToggle ? '#2980b9' : 'black'
              }, textColorStyle]}
            />
          </TouchableOpacity>
          }
          <TouchableOpacity
            style={{width: buttonWidth, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={this.props.handleOpenInBrowserPress}
          >
            <MaterialCommunityIcon
              name={'open-in-app'}
              style={[{
                fontSize: 30
              }, textColorStyle]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{width: buttonWidth, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={this.props.handleBookmarkPress}
          >
            <MaterialCommunityIcon
              name={this.props.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              style={[{
                fontSize: 30
              }, textColorStyle]}
            />
          </TouchableOpacity>
          {this.props.showMenuButton &&
          <TouchableOpacity
            style={{width: buttonWidth, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={this.props.handleDrawerPress}
          >
            <MaterialCommunityIcon
              name={'menu'}
              style={[{
                fontSize: 30
              }, textColorStyle]}
            />
          </TouchableOpacity>
          }
          {!this.props.showMenuButton &&
            <View style={{width: buttonWidth}} />
          }
        </View>
      </View>
    );
  }
}