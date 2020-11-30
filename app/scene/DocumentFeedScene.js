/**
 * @flow
 */

import React from 'react';
import { observer } from 'mobx-react/native';
import styleStore from '../store/StyleStore';
import {SafeAreaView, FlatList, View, StyleSheet, StatusBar, Text, Platform} from 'react-native';
import type { Hit } from '../service/ExternalDocumentService';
import DocumentListItem from '../component/DocumentListItem';
import DocumentListNavBar from '../component/DocumentListNavBar';
import MessageToast from '../component/MessageToast';
import documentFeedStore from '../store/DocumentFeedStore';
import TextFilterPanel from '../component/TextFilterPanel';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';
import AdBanner from '../component/AdBanner';

type Props = {
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 0 : 10,
    backgroundColor: 'white',
    flex: 1
  }
});

const DocumentFeedScene = observer(class DocumentFeedScene extends React.Component<Props, State> {

  componentDidMount() {
    // Give time for the cached results to be hydrated
    setTimeout(() => documentFeedStore.search(), 250);
  }

  componentDidUpdate() {
    // Warning: DocumentFeedScene is accessing findNodeHandle inside its render(). render() should be a pure function of props and state. It should never access something that requires stale data from the previous render, such as refs. Move this logic to componentDidMount and componentDidUpdate instead.
    if (documentFeedStore.start === 0 && this._flatList) {
      this._flatList.scrollToOffset({offset: 0, animated: false});
    }
  }

  onEndReached = () => {
    const hasReachedEnd = documentFeedStore.hits.length >= documentFeedStore.totalNumResults;
    console.log(hasReachedEnd, documentFeedStore.hits.length, documentFeedStore.totalNumResults);
    if (documentFeedStore.isReady() && !hasReachedEnd) {
      documentFeedStore.start = documentFeedStore.start + documentFeedStore.pageSize;
      documentFeedStore.search();
    }
  };

  onRefresh = () => {
    if (documentFeedStore.isReady()) {
      documentFeedStore.refresh();
    }
  };

  renderItem(item: Hit, textColor: string) {
    return (
      <DocumentListItem
        hit={item}
        showSiteName={documentFeedStore.querySiteName === null}
        showCategory={documentFeedStore.queryCategory === null && item.category}
        textColor={textColor}
        globalPreferencesStore={this.props.globalPreferencesStore}
      />
    );
  }

  render () {
    const { darkModeEnabled } = this.props.globalPreferencesStore;
    const dynamicContainerStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textColor = styleStore.getTextColor(darkModeEnabled);
    const title = documentFeedStore.queryTitle;
    const subtitle = documentFeedStore.queryCategory;
    const sort = `by ${documentFeedStore.sortAsc ? 'ascending' : 'descending'} ${documentFeedStore.sortBy.replace(/_/g, ' ')}`
    const listHeader = (
      <View style={{margin: 10, marginLeft: 15, marginBottom: 15}}>
        <View style={{marginBottom: 5}}>
          <Text
            style={[{fontSize: 28, fontWeight: 'bold', color: '#34495e', marginBottom: 3}, {color: textColor}]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {!!subtitle &&
          <Text
            style={[{fontSize: 22, color: '#34495e', marginBottom: 3}, {color: textColor}]}
            numberOfLines={1}
          >
            {subtitle}
            <Text style={{fontSize: 16, color: 'gray'}}>
              {` • ${sort}`}
            </Text>
          </Text>
          }
          {!subtitle &&
          <Text
            style={[{fontSize: 16, color: 'gray', marginBottom: 3}]}
            numberOfLines={1}
          >
            {sort}
          </Text>
          }
        </View>
        <TextFilterPanel
          textFilters={documentFeedStore.queryText ? documentFeedStore.queryText.split(/[\s,]/): []}
          onRemoveTextFilter={(textFilter) => {
            documentFeedStore.queryText = documentFeedStore.queryText.replace(textFilter, '').trim();
            documentFeedStore.search();
          }}
          textColor={textColor}
        />
      </View>
    );
    return (
      <SafeAreaView
        style={[styles.container, dynamicContainerStyle]}
      >
        <StatusBar
          backgroundColor={darkModeEnabled ? 'black' : 'white'}
          barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
        />
        <DocumentListNavBar
          textColor={textColor}
        />

        {documentFeedStore.hits.length > 0 &&
        <FlatList
          ListHeaderComponent={listHeader}
          style={{flex: 1}}
          ref={ref => this._flatList = ref}
          data={documentFeedStore.hits}
          keyExtractor={(item: Hit, index: number) => item.id}
          renderItem={({item}) => this.renderItem(item, textColor)}
          onEndReached={this.onEndReached}
          refreshing={documentFeedStore.refreshing}
          onRefresh={this.onRefresh}
        />
        }
        {documentFeedStore.fetchingDocuments && !documentFeedStore.refreshing &&
        <MessageToast
          text='loading'
          color='white'
          backgroundColor='#2980b9'
        />
        }
        {documentFeedStore.error &&
        <MessageToast
          //text={documentFeedStore.error.message}
          text={JSON.stringify(documentFeedStore.error)}
          color='white'
          backgroundColor='#c0392b'
          fadeOutInMillis={2000}
        />
        }
        <AdBanner />
      </SafeAreaView>
    );
  }
});

export default DocumentFeedScene;
