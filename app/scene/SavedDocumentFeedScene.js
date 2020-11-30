/**
 * @flow
 */


import { Dimensions, StyleSheet, View, FlatList, SafeAreaView, Text } from 'react-native';
import { observer } from 'mobx-react/native';
import React from 'react';
import savedDocumentStore from '../store/SavedDocumentStore';
import type { Hit } from '../service/ExternalDocumentService';
import DocumentListItem from '../component/DocumentListItem';
import documentFeedStore from '../store/DocumentFeedStore';
import globalPreferencesStore from '../store/GlobalPreferencesStore';
import styleStore from '../store/StyleStore';
import SimpleNavBar from '../component/SimpleNavBar';
import AdBanner from '../component/AdBanner';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
}

type State = {
}

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('window').height
  }
});

const SavedDocumentFeedScene = observer(class SavedDocumentFeedScene extends React.Component<Props, State> {

  renderItem(item: Hit) {
    return (
      <DocumentListItem
        hit={item}
        showSiteName={documentFeedStore.querySiteName === null}
        showCategory={documentFeedStore.queryCategory === null && item.category}
        globalPreferencesStore={globalPreferencesStore}
      />
    );
  }

  render() {
    const { darkModeEnabled } = globalPreferencesStore;
    const backgroundStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textColor = styleStore.getTextColor(darkModeEnabled);
    const textStyle = styleStore.getTextColorStyle(darkModeEnabled);
    const hits = savedDocumentStore.findAsHits();
    return (
      <SafeAreaView
        style={[styles.container, backgroundStyle]}
      >
        <SimpleNavBar
          title='Saved documents'
          textColor={textColor}
        />
        {hits.length === 0 &&
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <MaterialCommunityIcon
            name={'bookmark-outline'}
            style={[{fontSize: 40}, textStyle]}
          />
          <Text style={[{fontSize: 18, width: 210, textAlign: 'center'}, textStyle]}>
            To see your saved articles here use the bookmark icon found on each document, or long press it in the article
            feed
          </Text>
        </View>
        }
        <FlatList
          style={{paddingTop: 20}}
          data={hits}
          keyExtractor={(item: Hit, index: number) => item.id}
          renderItem={({item}) => this.renderItem(item)}
        />
        <AdBanner/>
      </SafeAreaView>
    )
  }

});

export default SavedDocumentFeedScene;
