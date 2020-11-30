/**
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking
} from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import DocumentFeedFilterRow from '../component/DocumentFeedFilterRow';
import Collapsible from 'react-native-collapsible';
import documentFeedStore from '../store/DocumentFeedStore';
import { Actions } from 'react-native-router-flux';
import recentlyTappedHitStore from '../store/RecentlyTappedHitStore';
import savedDictionaryEntryStore, { SavedDictionaryEntry } from '../store/SavedVocabularyStore';
import savedDocumentStore from '../store/SavedDocumentStore';
import { observer } from 'mobx-react/native';
import styleStore from '../store/StyleStore';
import globalPreferencesStore from '../store/GlobalPreferencesStore';
import RecentDocumentRow from '../component/RecentDocumentRow';
import billingService from '../service/BillingService';
import patreonService from "../service/PatreonService";
import * as Progress from 'react-native-progress';

const Color = require('color');

type SiteFilter = {
  title: string,
  queryText: string,
  querySiteName: string,
  categories: string[]
}

type FeedFilter = {
  title: string,
  querySiteName: string
}

type Props = {}

type State = {
  isRecentSearchesCollapsed: boolean,
  isFullTextSourcesCollapsed: boolean,
  isFeedTextSourcesCollapsed: boolean,
  isRecentDocumentsCollapsed: boolean,
  isBookmarksCollapsed: boolean,
  showAdRemovalButton: boolean,
  fundingGoalProgress: number
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 22,
    color: 'grey'
  }
});

const filterRowMinHeight = 40;
const filterRowTitleSize = 17;

const DocumentFeedDrawer = observer(class DocumentFeedDrawer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      isRecentSearchesCollapsed: false,
      isFullTextSourcesCollapsed: false,
      isFeedTextSourcesCollapsed: false,
      isRecentDocumentsCollapsed: false,
      isBookmarksCollapsed: false,
      showAdRemovalButton: false,
      fundingGoalProgress: null
    }
  }

  componentDidMount() {
    billingService.didPurchaseAdRemoval().then(didPurchase => this.setState({showAdRemovalButton: !didPurchase}));
    patreonService.getFundingGoalProgress().then(fundingGoalProgress => this.setState({fundingGoalProgress}));
  }

  getSeparator(title: string, collapseKey: string, backgroundColor, textColor) {
    return (
      <TouchableOpacity
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          borderBottomWidth: 2,
          borderBottomColor: 'lightgray',
          padding: 5,
          paddingLeft: 10
        }}
        onPress={() => {
          const newState = {};
          newState[collapseKey] = !this.state[collapseKey];
          this.setState(newState);
        }}
      >
        <Text style={{
          fontSize: 15,
          fontWeight: '500',
          color: Color(textColor).alpha(0.4)
        }}>
          {title.toUpperCase()}
        </Text>
        <MaterialCommunityIcon
          name={this.state[collapseKey] ? 'chevron-right' : 'chevron-down'}
          style={{
            color: Color('#2c3e50').alpha(0.7),
            fontSize: 24,
            marginRight: 8
          }}
        />
      </TouchableOpacity>
    )
  }

  onFilterPress(title: string, text: string, siteName: string, category: string = null): void {
    documentFeedStore.start = 0;
    documentFeedStore.queryText = text;
    documentFeedStore.queryTitle = title;
    documentFeedStore.querySiteName = siteName;
    documentFeedStore.queryCategory = category;
    documentFeedStore.search();
    Actions.drawerClose();
  }

  getFullTextSourceFilterRows(textColor: string) {
    return [
      {
        title: 'NHK News Easy',
        queryText: null,
        querySiteName: 'www3.nhk.or.jp_news_easy',
        categories: null
      },
      {
        title: 'NHK News',
        queryText: null,
        querySiteName: 'www3.nhk.or.jp_news',
        categories: ['top', 'business', 'entertainment', 'international', 'science', 'society', 'politics', 'sports']
      },
      {
        title: 'BBC News',
        queryText: null,
        querySiteName: 'www.bbc.com',
        categories: null
      },
      {
        title: 'CNN News',
        queryText: null,
        querySiteName: 'www.cnn.co.jp',
        categories: null
      },
      {
        title: 'Hukumusume - folk stories',
        queryText: null,
        querySiteName: 'hukumusume.com',
        categories: null
      },
    ].map(siteFilter => {
      const isSelectedSite = documentFeedStore.querySiteName === siteFilter['querySiteName'];
      const collapseKey = `is${siteFilter.querySiteName}Collapsed`;
      const collapsedCategories = this.state[collapseKey] === undefined ? true : this.state[collapseKey];
      if (siteFilter.categories) {
        return (
          <View key={siteFilter['title']}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <View style={{flex: 1}}>
                <DocumentFeedFilterRow
                  minHeight={filterRowMinHeight}
                  titleSize={filterRowTitleSize}
                  isSelected={isSelectedSite}
                  title={siteFilter['title']}
                  onPress={() => this.onFilterPress(siteFilter['title'], siteFilter['queryText'], siteFilter['querySiteName'])}
                  backgroundColor='transparent'
                  textColor={textColor}
                />
              </View>
              <TouchableOpacity
                style={{height: 50, width: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
                onPress={() => {
                  const newState = this.state;
                  newState[collapseKey] = !(this.state[collapseKey] === undefined ? true : this.state[collapseKey]);
                  console.log(newState[collapseKey]);
                  this.setState(newState);
                }}
              >
                <MaterialCommunityIcon
                  name={collapsedCategories ? 'chevron-right' : 'chevron-down'}
                  style={{
                    color: '#2c3e50',
                    fontSize: 30,
                    marginRight: 8
                  }}
                />
              </TouchableOpacity>
            </View>
            <Collapsible collapsed={collapsedCategories}>
              {this.getSiteCategoryFilterRows(siteFilter, isSelectedSite, textColor)}
            </Collapsible>
          </View>
        )
      } else {
        return (
          <DocumentFeedFilterRow
            minHeight={filterRowMinHeight}
            titleSize={filterRowTitleSize}
            key={siteFilter['title']}
            title={siteFilter['title']}
            onPress={() => this.onFilterPress(siteFilter['title'], siteFilter['queryText'], siteFilter['querySiteName'])}
            backgroundColor='transparent'
            isSelected={isSelectedSite}
            textColor={textColor}
          />
        )
      }
    });
  }

  getFeedCategoriesFilterRows(textColor: string) {
    return [
      {
        title: 'Technology',
        category: 'technology',
        feedFilters: [
          {
            title: 'Engadget',
            siteName: 'japanese.engadget.com'
          },
          {
            title: 'Gizmodo',
            siteName: 'www.gizmodo.jp'
          },
          {
            title: 'Techable',
            siteName: 'techable.jp'
          }
        ]
      },
      {
        title: 'Entertainment',
        category: 'entertainment',
        feedFilters: [
          {
            title: 'Mantan Web',
            siteName: 'mantan-web.jp'
          },
          {
            title: 'Karapaia',
            siteName: 'karapaia.com'
          },
          {
            title: 'Yukawanet',
            siteName: 'yukawanet.com'
          },
          {
            title: 'Labaq',
            siteName: 'labaq.com'
          },
        ]
      },
      {
        title: 'Gaming',
        category: 'gaming',
        feedFilters: [
          {
            title: 'Doope',
            siteName: 'doope.jp'
          },
          {
            title: 'Automaton',
            siteName: 'automaton-media.com'
          },
          {
            title: '4gamer',
            siteName: 'www.4gamer.net'
          },
          {
            title: 'Famitsu',
            siteName: 'www.famitsu.com'
          },
          {
            title: 'Inside Games',
            siteName: 'www.inside-games.jp'
          },
        ]
      },
      {
        title: 'Food',
        category: 'food',
        feedFilters: [
          {
            title: 'Entabe',
            siteName: 'entabe.jp'
          },
          {
            title: 'All About Food',
            siteName: 'allabout.co.jp'
          },
          {
            title: 'Oricon Gourmet',
            siteName: 'www.oricon.co.jp'
          }
        ]
      },
      {
        title: 'Science',
        category: 'science',
        feedFilters: [
          {
            title: 'National Geographic',
            siteName: 'natgeo.nikkeibp.co.jp'
          }
        ]
      },
      {
        title: 'Travel',
        category: 'travel',
        feedFilters: [
          {
            title: 'Tabizine',
            siteName: 'tabizine.jp'
          }
        ]
      }
    ].map(categoryFilter => {
      const isSelectedSite = documentFeedStore.querySiteName === null && documentFeedStore.queryCategory === categoryFilter['category'];
      const collapseKey = `is${categoryFilter.category}Collapsed`;
      const collapsedCategories = this.state[collapseKey] === undefined ? true : this.state[collapseKey];
      return (
        <View key={categoryFilter['title']}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <View style={{flex: 1}}>
              <DocumentFeedFilterRow
                minHeight={filterRowMinHeight}
                titleSize={filterRowTitleSize}
                title={categoryFilter['title']}
                onPress={() => this.onFilterPress(`${categoryFilter['title']} feed`,null, null, categoryFilter['category'])}
                isSelected={isSelectedSite}
                backgroundColor='transparent'
                textColor={textColor}
              />
            </View>
            <TouchableOpacity
              style={{height: 50, width: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}
              onPress={() => {
                const newState = this.state;
                newState[collapseKey] = !(this.state[collapseKey] === undefined ? true : this.state[collapseKey]);
                console.log(newState[collapseKey]);
                this.setState(newState);
              }}
            >
              <MaterialCommunityIcon
                name={collapsedCategories ? 'chevron-right' : 'chevron-down'}
                style={{
                  color: '#2c3e50',
                  fontSize: 30,
                  marginRight: 8
                }}
              />
            </TouchableOpacity>
          </View>
          <Collapsible collapsed={collapsedCategories}>
            {this.getFeedFilterRows(categoryFilter.feedFilters, categoryFilter['category'], textColor)}
          </Collapsible>
        </View>
      )
    });
  }

  getFeedFilterRows(
    feedFilters: FeedFilter[],
    category: string,
    textColor: string
  ) {
    return feedFilters.map((feedFilter: FeedFilter) => {
      const { siteName, title } = feedFilter;
      const isSelectedSiteName = documentFeedStore.querySiteName === siteName;
      const isSelectedCategory = documentFeedStore.queryCategory === category;
      return (
        <DocumentFeedFilterRow
          minHeight={filterRowMinHeight}
          titleSize={filterRowTitleSize}
          key={`${siteName}#${category}`}
          title={title}
          paddingLeft={17}
          onPress={() => this.onFilterPress(title, null, siteName, category)}
          backgroundColor='transparent'
          isSelected={isSelectedSiteName && isSelectedCategory}
          textColor={textColor}
        />
      );
    });
  }

  getSiteCategoryFilterRows(
    siteFilter: SiteFilter,
    isSelectedSite: boolean,
    textColor: string
  ) {
    return siteFilter.categories.map(category => {
      const isSelectedCategory = documentFeedStore.queryCategory === category;
      return (
        <DocumentFeedFilterRow
          minHeight={filterRowMinHeight}
          titleSize={filterRowTitleSize}
          key={`${siteFilter['title']}#${category}`}
          title={category}
          paddingLeft={17}
          isSelected={isSelectedSite && isSelectedCategory}
          onPress={() => this.onFilterPress(siteFilter['title'], siteFilter['queryText'], siteFilter['querySiteName'], category)}
          backgroundColor='transparent'
          textColor={textColor}
        />
      );
    });
  }

  renderRecentDocuments(textColor: string) {
    return recentlyTappedHitStore.hitQueue.map(hit =>
      <RecentDocumentRow
        key={hit.url}
        hit={hit}
        textColor={textColor}
      />
    );
  }

  renderAppIcon(darkModeEnabled: boolean) {
    const image = darkModeEnabled
      ? require('../../img/Icon-App-1024x1024-dark.png')
      : require('../../img/Icon-App-1024x1024.png');
    return (
      <Image
        style={{height: 40, width: 40, opacity: 0.8}}
        source={image}
      />
    )
  }

  renderCollapsibleFullTextSourcesPanel(textColor: string) {
    return (
      <Collapsible collapsed={this.state.isFullTextSourcesCollapsed}>
        <DocumentFeedFilterRow
          minHeight={filterRowMinHeight}
          titleSize={filterRowTitleSize}
          title='All'
          onPress={() => this.onFilterPress('All', null, null)}
          isSelected={documentFeedStore.querySiteName === null  && documentFeedStore.queryCategory === null}
          backgroundColor='transparent'
          textColor={textColor}
        />
        {this.getFullTextSourceFilterRows(textColor)}
      </Collapsible>
    );
  }

  renderBottomRows(textColor: string) {
    return (
      <View
        style={{
          paddingLeft: 4,
          borderTopWidth: 2,
          borderTopColor: '#f0f0f0'
        }}
      >
        <DocumentFeedFilterRow
          minHeight={filterRowMinHeight}
          titleSize={filterRowTitleSize}
          title='Keep this app ad-free'
          onPress={() => Linking.openURL('https://www.patreon.com/tangoristo/')}
          backgroundColor='transparent'
          textColor={textColor}
          iconComponent={
            <View style={{marginTop: 3}}>
              <Progress.Circle
                color={'#c0392b'}
                animated={this.state.fundingGoalProgress !== null}
                progress={this.state.fundingGoalProgress ? this.state.fundingGoalProgress : 0}
                size={20}
                thickness={3}
                borderWidth={2}
              />
            </View>
          }
        />
        <DocumentFeedFilterRow
          minHeight={filterRowMinHeight}
          titleSize={filterRowTitleSize}
          title='Custom text analysis'
          onPress={() => Actions.customTextAnalysis()}
          backgroundColor='transparent'
          textColor={textColor}
          iconComponent={
            <EntypoIcon
              name='pencil'
              style={styles.icon}
            />
          }
        />
        <DocumentFeedFilterRow
          minHeight={filterRowMinHeight}
          titleSize={filterRowTitleSize}
          title='Preferences'
          onPress={() => Actions.preferences()}
          iconComponent={
            <MaterialCommunityIcon
              name='settings'
              style={styles.icon}
            />
          }
          backgroundColor='transparent'
          textColor={textColor}
        />
        <DocumentFeedFilterRow
          minHeight={filterRowMinHeight}
          titleSize={filterRowTitleSize}
          title='About'
          onPress={() => Actions.about()}
          iconComponent={
            <MaterialCommunityIcon
              name='information-outline'
              style={styles.icon}
            />
          }
          backgroundColor='transparent'
          textColor={textColor}
        />
      </View>
    );
  }

  renderCollapsibleBookmarks(textColor: string) {
    return (
      <Collapsible collapsed={this.state.isBookmarksCollapsed}>
        <DocumentFeedFilterRow
          minHeight={filterRowMinHeight}
          titleSize={filterRowTitleSize}
          title={'Documents'}
          badgeCount={savedDocumentStore.findAsHits().length}
          onPress={() => Actions.savedDocumentFeedScene()}
          backgroundColor='transparent'
          textColor={textColor}
          iconComponent={
            <MaterialCommunityIcon
              name='bookmark-outline'
              style={styles.icon}
            />
          }
        />
        <DocumentFeedFilterRow
          minHeight={filterRowMinHeight}
          titleSize={filterRowTitleSize}
          title={'Vocabulary'}
          badgeCount={savedDictionaryEntryStore.find().length}
          onPress={() => {
            const language = 'ja';
            const vocabulary = savedDictionaryEntryStore.find()
              .map((entry: SavedDictionaryEntry) => {
                return {
                  dictionaryEntry: entry.dictionaryEntry,
                  firstOccurrenceOffset: 0,
                  reading: '',
                  tokenSequenceOccurrences: []
                };
              });
            Actions.textVocabularyScene({language, vocabulary, title: 'Vocabulary saved in Tangoristo', isBookmarks: true});
          }}
          backgroundColor='transparent'
          textColor={textColor}
          iconComponent={
            <MaterialCommunityIcon
              name='bookmark-outline'
              style={styles.icon}
            />
          }
        />
      </Collapsible>
    );
  }

  render () {
    console.log('DocumentFeedDrawer', this.props);
    const { darkModeEnabled } = globalPreferencesStore;
    const backgroundColorStyle = styleStore.getContainerBackgroundColorStyle(darkModeEnabled);
    const textColor = styleStore.getTextColor(darkModeEnabled);
    const separatorBackgroundColor = darkModeEnabled ? '#8e8e8e' : '#f0f0f0';
    return (
      <SafeAreaView style={[{flex: 1}, backgroundColorStyle]}>
        <ScrollView
          style={{flex: 1, marginTop: 0}}
        >
          {this.getSeparator('Bookmarks', 'isBookmarksCollapsed', separatorBackgroundColor, textColor)}
          {this.renderCollapsibleBookmarks(textColor)}
          {this.getSeparator('Feeds', 'isFullTextSourcesCollapsed', separatorBackgroundColor, textColor)}
          {this.renderCollapsibleFullTextSourcesPanel(textColor)}
          <Collapsible collapsed={this.state.isFeedTextSourcesCollapsed}>
            {this.getFeedCategoriesFilterRows(textColor)}
          </Collapsible>
          {this.getSeparator('Recently opened', 'isRecentDocumentsCollapsed', separatorBackgroundColor, textColor)}
          <Collapsible collapsed={this.state.isRecentDocumentsCollapsed}>
            {this.renderRecentDocuments(textColor)}
          </Collapsible>
        </ScrollView>
        {this.renderBottomRows(textColor)}
      </SafeAreaView>
    )
  }
});

export default DocumentFeedDrawer;
