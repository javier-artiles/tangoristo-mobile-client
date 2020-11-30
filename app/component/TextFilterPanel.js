import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  textFilters: string[],
  onRemoveTextFilter: (textFilter: string) => {},
  textColor: string
}

export default class TextFilterPanel extends React.Component<Props, State> {

  getFilterButtons() {
    return this.props.textFilters.map(textFilter => {
      return (
        <TouchableOpacity
          key={textFilter}
          style={{
            marginRight: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0.5,
            borderRadius: 10,
            borderColor: this.props.textColor,
            padding: 5,
            paddingLeft: 9,
            paddingRight: 9
          }}
          onPress={() => this.props.onRemoveTextFilter(textFilter)}
        >
          <MaterialCommunityIcon
            name={'close-circle'}
            style={{
              color: 'grey',
              fontSize: 16,
            }}
          />
          <Text style={{
            marginLeft: 8,
            marginBottom: 2,
            fontSize: 16,
            fontWeight: 'bold',
            color: this.props.textColor
          }}>
            {textFilter}
          </Text>
        </TouchableOpacity>
      );
    });
  }

  render() {
    return (
      <View style={{flexDirection: 'row'}}>
        {this.getFilterButtons()}
      </View>
    );
  }
}