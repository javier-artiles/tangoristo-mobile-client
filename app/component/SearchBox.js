/**
 * @flow
 */


import React from "react";
import { SafeAreaView, View, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  onPressClose: () => void,
  onSearch: (query: string) => void,
  initialText: string
}

type State = {
  text: string
}

export default class SearchBox extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      text: props.initialText
    }
  }

  render () {
    return (
      <View
        style={{
          zIndex: 2,
          width: Dimensions.get('window').width,
          borderBottomWidth: 1,
          borderBottomColor: 'gray'
        }}
      >
        <View
          style={{
            height: 50,
            width: Dimensions.get('window').width,
            paddingTop: 10,
            alignItems: 'center',
            backgroundColor: 'white',
            flexDirection: 'row'
          }}
        >
          <TouchableOpacity
            onPress={this.props.onPressClose}
          >
            <MaterialCommunityIcon
              name='arrow-left'
              style={{
                color: 'black',
                fontSize: 32,
                paddingLeft: 10,
                paddingRight: 20,
              }}
            />
          </TouchableOpacity>
          <TextInput
            autoFocus
            style={{height: 40, fontSize: 24, flex: 1}}
            onChangeText={(text) => {
              this.setState({text}, this.props.onSearch(text));
            }}
            value={this.state.text}
          />
          <TouchableOpacity
            onPress={() => this.setState({text: ''}, this.props.onSearch(''))}
          >
            <MaterialCommunityIcon
              name='close'
              style={{
                color: 'grey',
                fontSize: 34,
                paddingLeft: 10,
                paddingRight: 20,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}