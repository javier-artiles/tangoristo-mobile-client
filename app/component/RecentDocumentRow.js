/**
 * @flow
 */

import React from 'react';
import { Dimensions, View, ScrollView, Image, Text, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import type { Hit } from '../service/ExternalDocumentService';

type Props = {
  hit: Hit,
  textColor: string
};

type State = {
  failedToLoadImage: boolean
};

export default class RecentDocumentRow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      failedToLoadImage: false
    };
  }

  render() {
    const { hit, textColor } = this.props;
    const width = Dimensions.get('window').width * 0.8 - (this.state.failedToLoadImage ? 25 : 80);
    return (
      <TouchableOpacity
        key={hit.id}
        style={{
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'lightgray',
          flexDirection: 'row'
        }}
        onPress={() => {
          Actions.documentText({articleKey: hit.id, hit});
        }}
      >
        {!this.state.failedToLoadImage &&
        <Image
          style={{width: 50, height: 50, borderRadius: 5, marginRight: 10}}
          source={{uri: hit.thumbnailUrl}}
          onError={(error) => this.setState({failedToLoadImage: true})}
        />
        }
        <View>
          <Text
            numberOfLines={2}
            style={{
              fontSize: 16,
              width,
              color: textColor
            }}>
            {hit.title}
          </Text>
          <Text numberOfLines={1} style={{fontSize: 11, color: textColor}}>
            {hit.siteName.replace('_', '/')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}