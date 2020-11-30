/**
 * @flow
 */

import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Actions } from 'react-native-router-flux';

type Props = {
  onPressFilter: () => void,
  onPressOpenSearchBox: () => void,
  onPressExport: () => void,
  backgroundStyle: {},
  textStyle: {}
}

type State = {

}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
    width: Dimensions.get('window').width - 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    borderColor: 'lightgray',
    marginLeft: 5,
    marginRight: 5
  }
});

export default class VocabularyListNavBar extends React.Component<Props, State> {
  render() {
    return (
      <View style={[styles.container, this.props.backgroundStyle]}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => Actions.pop()}
          >
            <MaterialCommunityIcon
              name={'chevron-left'}
              style={[{
                marginLeft: 8,
                marginTop: 5,
                fontSize: 38
              }, this.props.textStyle]}
            />
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', paddingRight: 10}}>
          <TouchableOpacity
            onPress={this.props.onPressExport}
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
          >
            <MaterialCommunityIcon
              name={'share'}
              style={[{
                fontSize: 30
              }, this.props.textStyle]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.props.onPressOpenSearchBox}
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
          >
            <MaterialCommunityIcon
              name={'magnify'}
              style={[{
                fontSize: 30
              }, this.props.textStyle]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Actions.textVocabularySort()}
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
          >
            <MaterialCommunityIcon
              name={'sort'}
              style={[{
                fontSize: 30
              }, this.props.textStyle]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.props.onPressFilter}
            style={{width: 40, height: 50, alignItems: 'center', justifyContent: 'center'}}
          >
            <MaterialCommunityIcon
              name={'filter-outline'}
              style={[{
                fontSize: 30
              }, this.props.textStyle]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}