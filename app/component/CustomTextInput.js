/**
 * @flow
 */

import React from 'react';
import {
  StyleSheet,
  TextInput,
  View
} from 'react-native';


type Props = {
  color: string,
  marginTop: number,
  fontSize: number,
  padding: number,
  placeholderText: string,
  defaultValue: string,
  maxLength: number,
  onChangeText: (text: string) => void
}

type State = {
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default class CustomTextInput extends React.Component<Props, State> {

  render() {
    const {
      color,
      marginTop,
      fontSize,
      padding,
      placeholderText,
      defaultValue,
      maxLength,
      onChangeText
    } = this.props;
    return (
      <View style={styles.container}>
        <TextInput
            style={{
              marginTop,
              color,
              fontSize,
              padding,
            }}
            defaultValue={defaultValue}
            multiline={true}
            autoFocus={true}
            placeholder={placeholderText}
            autoCorrect={false}
            onChangeText={(text) => onChangeText(text)}
            maxLength={maxLength}
            underlineColorAndroid={'transparent'}
        />
      </View>
    );
  }
};
