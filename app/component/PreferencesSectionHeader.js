/**
 * @flow
 */


import React from "react";
import { StyleSheet, View, Text } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

type Props = {
  title: string,
  isFolded: boolean,
  fontSize: number,
  paddingTop: number,
  paddingBottom: number,
  paddingLeft: number,
  paddingRight: number
}

type State = {}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  sectionHeader: {
    marginLeft: 20,
    marginTop: 6,
    fontWeight: 'bold',
    color: '#9b9b9b',
    fontSize: 17
  },
  icon: {
    color: '#AAAAAA'
  }
});

export default class PreferencesSectionHeader extends React.Component<Props, State> {
  static defaultProps = {
    paddingTop: 10,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 24
  };

  render () {
    const {paddingTop, paddingBottom, paddingRight} = this.props;
    return (
      <View style={[styles.container, {paddingTop, paddingBottom, paddingRight}]}>
        <Text style={styles.sectionHeader}>
          {this.props.title.toUpperCase()}
        </Text>
        <FontAwesomeIcon
          name={this.props.isFolded ? 'caret-right' : 'caret-down'}
          style={[styles.icon, {fontSize: this.props.fontSize + 12}]}
        />
      </View>
    );
  }
}