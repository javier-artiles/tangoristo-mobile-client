/**
 * @flow
 */

import { Drawer, Router, Scene, Lightbox } from 'react-native-router-flux';
import DocumentFeedScene from './scene/DocumentFeedScene';
import React from 'react';
import DocumentFeedDrawer from './scene/DocumentFeedDrawer';
import DocumentTextScene from './scene/DocumentTextScene';
import DocumentFeedSearchLightbox from './scene/DocumentFeedSearchLightbox';
import DocumentFeedSortLightbox from './scene/DocumentFeedSortLightbox';
import SavedDocumentFeedScene from './scene/SavedDocumentFeedScene';
import TextVocabularyScene from './scene/TextVocabularyScene';
import TextVocabularySortLightbox from './scene/TextVocabularySortLightbox';
import VocabularyFilterLightbox from './scene/VocabularyFilterLightbox';
import VocabularyEntryScene from './scene/VocabularyEntryScene';
import DocumentTextDrawerLightbox from './scene/DocumentTextDrawerLightbox';
import VocabularyExportScene from './scene/VocabularyExportScene';
import PreferencesScene from './scene/PreferencesScene';
import globalPreferencesStore from './store/GlobalPreferencesStore';
import CustomTextAnalysisScene from './scene/CustomTextAnalysisScene';
import { Dimensions } from 'react-native';
import AboutScene from './scene/AboutScene';
import WordContextualMenuLightbox from "./scene/WordContextualMenuLightbox";

const App = () => (
  <Router
      /*
        backAndroidHandler return true to stay in the app and return false to exit the app.
        Default handler will pop a scene and exit the app at last when the back key is pressed on Android.
        */
      backAndroidHandler={() => {
        return false;
      }}
  >
    <Lightbox>
      <Scene
        key="root"
        hideNavBar
      >
        <Drawer
          key="documentFeedDrawer"
          drawerPosition='left'
          drawerWidth={Dimensions.get('window').width * 0.8}
          hideNavBar
          globalPreferencesStore={globalPreferencesStore}
          contentComponent={DocumentFeedDrawer}
        >
          <Scene
            key="documentFeed"
            hideNavBar
            globalPreferencesStore={globalPreferencesStore}
            component={DocumentFeedScene}
          />
        </Drawer>
        <Scene
          key="preferences"
          component={PreferencesScene}
          globalPreferencesStore={globalPreferencesStore}
          hideNavBar
        />
        <Scene
          key="about"
          component={AboutScene}
          globalPreferencesStore={globalPreferencesStore}
          hideNavBar
        />
        <Scene
          key="customTextAnalysis"
          component={CustomTextAnalysisScene}
          globalPreferencesStore={globalPreferencesStore}
          hideNavBar
        />
        <Scene
          key="documentText"
          hideNavBar
          globalPreferencesStore={globalPreferencesStore}
          component={DocumentTextScene}
        />
        <Scene
          key="savedDocumentFeedScene"
          component={SavedDocumentFeedScene}
          globalPreferencesStore={globalPreferencesStore}
        />
        <Scene
          key="textVocabularyScene"
          component={TextVocabularyScene}
        />
        <Scene
          key="vocabularyEntryScene"
          component={VocabularyEntryScene}
          globalPreferencesStore={globalPreferencesStore}
          hideNavBar
        />
        <Scene
          key="vocabularyExport"
          component={VocabularyExportScene}
          hideNavBar
        />
      </Scene>
      <Scene
        key="documentTextDrawer"
        component={DocumentTextDrawerLightbox}
        hideNavBar
      />
      <Scene
        key="vocabularyFilter"
        component={VocabularyFilterLightbox}
        hideNavBar
      />
      <Scene
        key="documentFeedSearch"
        component={DocumentFeedSearchLightbox}
        hideNavBar
        globalPreferencesStore={globalPreferencesStore}
      />
      <Scene
        key="wordContextualMenu"
        component={WordContextualMenuLightbox}
        hideNavBar
        globalPreferencesStore={globalPreferencesStore}
      />
      <Scene
        key="documentFeedSort"
        component={DocumentFeedSortLightbox}
        hideNavBar
      />
      <Scene
        key="textVocabularySort"
        component={TextVocabularySortLightbox}
        hideNavBar
      />
    </Lightbox>
  </Router>
);

module.exports = App;
