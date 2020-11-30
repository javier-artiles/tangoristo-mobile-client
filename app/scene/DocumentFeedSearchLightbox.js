/**
 * @flow
 */

import React from 'react';
import { SafeAreaView, View, TextInput, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import documentFeedStore from '../store/DocumentFeedStore';
import type { Query } from '../store/DocumentFeedStore';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';
import styleStore from '../store/StyleStore';

type Props = {
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {
  text: string
}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'rgba(52,52,52,0.5)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  container: {
    backgroundColor: 'white',
    width: Dimensions.get('window').width,
  }
});

export default class DocumentFeedSearchLightbox extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      text: ''
    }
  }

  onSubmit(query: Query) {
    documentFeedStore.start = 0;
    documentFeedStore.queryText = query.text;
    documentFeedStore.querySiteName = query.siteName;
    documentFeedStore.queryCategory = query.category;
    documentFeedStore.search();
    Actions.pop();
  }

  getRecentQueryRows(textColor: string) {
    return documentFeedStore.recentQueries.map((query: Query) => {
      const showSiteName = query.siteName && query.siteName.length > 0;
      return (
        <TouchableOpacity
          key={JSON.stringify(query)}
          style={{
            borderBottomWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            height: 55
          }}
          onPress={() => this.onSubmit(query)}
        >
          <MaterialCommunityIcon
            name='history'
            style={{
              color: textColor,
              fontSize: 34,
              paddingLeft: 10,
              paddingRight: 20,
            }}
          />
          <View>
            <Text
              style={{fontSize: showSiteName ? 22 : 26, color: textColor}}
            >
              {query.text}
            </Text>
            {!!showSiteName &&
            <Text style={{fontSize: 14, fontStyle: 'italic', color: textColor}}>
              {query.siteName.replace(/_/g, '/')}
              {query.category &&
                 ` > ${query.category}`
              }
            </Text>
            }
          </View>
        </TouchableOpacity>
      );
    })
  }

  render() {
    console.log('DocumentFeedSearchLightbox');
    const { darkModeEnabled } = this.props.globalPreferencesStore;
    const backgroundColorStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textColor = styleStore.getTextColor(darkModeEnabled);
    return (
        <TouchableOpacity
          style={styles.shadow}
          onPress={() => Actions.pop()}
        >
          <SafeAreaView style={[styles.container, backgroundColorStyle]}>
            <View style={{
              borderBottomWidth: 1,
              flexDirection: 'row',
              borderBottomColor: '#7f8c8d',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <TouchableOpacity
                onPress={() => Actions.pop()}
              >
                <MaterialCommunityIcon
                  name='arrow-left'
                  style={{
                    color: textColor,
                    fontSize: 34,
                    paddingLeft: 10,
                    paddingRight: 20,
                  }}
                />
              </TouchableOpacity>
              <TextInput
                autoFocus
                style={{height: 50, fontSize: 24, flex: 1, color: textColor}}
                onChangeText={(text) => this.setState({text})}
                value={this.state.text}
                onSubmitEditing={() => {
                  const query = {
                    text: this.state.text,
                    siteName: documentFeedStore.querySiteName,
                    category: documentFeedStore.queryCategory
                  };
                  this.onSubmit(query)
                }}
              />
            </View>
            {this.getRecentQueryRows(textColor)}
          </SafeAreaView>
        </TouchableOpacity>
    )
  }

}