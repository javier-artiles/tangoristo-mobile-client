/**
 * @flow
 */

import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from './Button';
import React from 'react';


type Props = {
  color: string,
  showFetchButton: boolean,
  hideAnalyzeButton: boolean,
  handleDrawerPress: () => {},
  handleAnalyzePress: () => {},
  handleFetchPress: () => {},
  handleClearPress: () => {}
}

type State = {
}

const styles = StyleSheet.create({
  container: {
    flexDirection:'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 50,
    width: Dimensions.get('window').width - 10,
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    borderColor: 'lightgray',
    marginLeft: 5,
    marginRight: 5
  }
});

export default class CustomTextAnalysisNavBar extends React.Component<Props, State> {
  render() {
    const {color, handleDrawerPress, handleClearPress} = this.props;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 10,
          }}
          onPress={() => Actions.pop()}
        >
          <MaterialCommunityIcon
            name={'chevron-left'}
            style={{
              fontSize: 38,
              color
            }}
          />
        </TouchableOpacity>
        {!this.props.hideAnalyzeButton &&
        <Button
          text={this.props.showFetchButton ? 'Fetch' : 'Analyze'}
          fontSize={15}
          color={color}
          height={35}
          horizontalPadding={15}
          onPress={() => {
            this.props.showFetchButton
              ? this.props.handleFetchPress()
              : this.props.handleAnalyzePress();
          }}
        />
        }
        <Button
          text='Clear'
          fontSize={15}
          color={color}
          height={35}
          horizontalPadding={15}
          onPress={handleClearPress}
        />
        <TouchableOpacity
          style={{width: 50, height: 50, marginRight: 15, alignItems: 'center', justifyContent: 'center'}}
          onPress={handleDrawerPress}
        >
          <MaterialCommunityIcon
            name={'menu'}
            style={{fontSize: 30, marginTop: 4, color}}
          />
        </TouchableOpacity>
      </View>
    );
  }
}