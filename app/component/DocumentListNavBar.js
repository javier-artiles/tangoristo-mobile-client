/**
 * @flow
 */

import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Actions } from 'react-native-router-flux';
import documentFeedStore from '../store/DocumentFeedStore';


type Props = {
  textColor: string
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 50,
    width: Dimensions.get('window').width - 10,
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    borderColor: 'lightgray',
    marginLeft: 5,
    marginRight: 5
  }
});

export default class DocumentListNavBar extends React.Component<Props, State> {
  render() {
    const { textColor } = this.props;
    return (
      <View style={styles.container}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity
            style={{width: 60, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => Actions.drawerOpen()}
          >
            <MaterialCommunityIcon
              name={'menu'}
              style={{
                fontSize: 30,
                color: textColor
              }}
            />
          </TouchableOpacity>

        </View>
        <View style={{flexDirection: 'row', paddingRight: 10}}>
          <TouchableOpacity
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => Actions.documentFeedSearch()}
          >
            <MaterialCommunityIcon
              name={'magnify'}
              style={{
                fontSize: 30,
                color: textColor
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => Actions.documentFeedSort()}
          >
            <MaterialCommunityIcon
              name={'sort'}
              style={{
                fontSize: 30,
                color: textColor
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}