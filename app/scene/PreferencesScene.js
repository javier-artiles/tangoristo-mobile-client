/**
 * @flow
 */

import React from 'react';
import {ScrollView, View, SafeAreaView, StatusBar, Text, Linking, Alert} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import PreferencesSectionHeader from '../component/PreferencesSectionHeader';
import PreferencesColorPanel from '../component/PreferencesColorPanel'
import PreferencesDocumentListPanel from '../component/PreferencesDocumentListPanel';
import PreferencesTextPanel from '../component/PreferencesTextPanel';
import PreferencesVocabularyPanel from '../component/PreferencesVocabularyPanel';
import PreferencesCachePanel from '../component/PreferencesCachePanel';
import { observer } from 'mobx-react/native';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';
import styleStore from '../store/StyleStore';
import SimpleNavBar from '../component/SimpleNavBar';
import MessageToast from '../component/MessageToast';
import AdBanner from '../component/AdBanner';
import { toJS } from 'mobx';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import DocumentFeedFilterRow from '../component/DocumentFeedFilterRow';
import billingService from "../service/BillingService";


type Props = {
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {
  toastMessage: string,
  toastDurationInMillis: number
}

const preferencesScene = observer(class PreferencesScene extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      toastMessage: null,
      toastDurationInMillis: 1500
    }
  }

  getSections(textColor: string, rowBackgroundColor: string) {
    return [
      {
        index: 0,
        title: 'Color scheme',
        content: <PreferencesColorPanel
          globalPreferencesStore={this.props.globalPreferencesStore}
          textColor={textColor}
          backgroundColor={rowBackgroundColor}
        />
      },
      {
        index: 1,
        title: 'Document list',
        content: <PreferencesDocumentListPanel
          globalPreferencesStore={this.props.globalPreferencesStore}
          textColor={textColor}
          backgroundColor={rowBackgroundColor}
        />
      },
      {
        index: 2,
        title: 'Text',
        content: <PreferencesTextPanel
          globalPreferencesStore={this.props.globalPreferencesStore}
          textColor={textColor}
          backgroundColor={rowBackgroundColor}
        />
      },
      {
        index: 3,
        title: 'Vocabulary',
        content: <PreferencesVocabularyPanel
          globalPreferencesStore={this.props.globalPreferencesStore}
          textColor={textColor}
          backgroundColor={rowBackgroundColor}
        />
      },
      {
        index: 4,
        title: 'Cache',
        content: <PreferencesCachePanel
          onClearCachedArticles={(numCleared) => this.showMessage(`Cleared ${numCleared} cached article${numCleared !== 1 ? 's' : '' }`)}
          onClearCachedSearchResults={() => this.showMessage('Cleared cached search results')}
          textColor={textColor}
          backgroundColor={rowBackgroundColor}
        />
      }
    ];
  }

  showMessage(message: string) {
    this.setState({toastMessage: null}, () => this.setState({toastMessage: message}));
  }

  _renderHeader = (section, rowBackgroundColor) => {
    return (
      <View>
        <PreferencesSectionHeader
          title={section.title}
          isFolded={!this.props.globalPreferencesStore.unfoldedPreferencesScenePanels.includes(section.index)}
          rowBackgroundColor={rowBackgroundColor}
        />
      </View>
    );
  };

  _renderContent = section => {
    return section.content;
  };

  _updateSections = activeSections => {
    this.props.globalPreferencesStore.setUnfoldedPreferencesScenePanels(activeSections);
  };

  restoreInAppPurchases = () => {
    billingService.didPurchaseAdRemoval()
      .then( (heDid) => {
        if (heDid) {
          Alert.alert(
            'Restored previous purchase',
            'It seems you had previously purchased the ad removal feature.\n' +
            'We\'ve restored this purchase for you so you can continue enjoying Tangoristo without ads.\n' +
            'Thank you for supporting the development of this app!');
        } else {
          Alert.alert('We did not find any previous purchase',
            'We tried to restore previous purchases ' +
            'but did not find any associated to this account.');
        }
      })
      .catch( (e) => {
        Alert.alert(
          'Failed to check your in-app purchase history',
          'If the error persist please write me at contact@tangoristo.com');
        console.warn('Failed to check if the user purchased ad removal', e);
      });
  };

  render () {
    const { darkModeEnabled, unfoldedPreferencesScenePanels } = this.props.globalPreferencesStore;
    const backgroundColor = darkModeEnabled ? 'black' : '#f0f0f0';
    const rowBackgroundColor = darkModeEnabled ? '#323232' : 'white';
    const textColor = styleStore.getTextColor(darkModeEnabled);
    const sections = this.getSections(textColor, rowBackgroundColor);
    return (
      <SafeAreaView
        style={{
          backgroundColor: rowBackgroundColor,
          flex: 1
        }}
      >
        <StatusBar
          backgroundColor={darkModeEnabled ? 'black' : 'white'}
          barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
        />
        <SimpleNavBar
          title='Preferences'
          textColor={textColor}
        />
        <ScrollView>
          <Accordion
            sections={sections}
            expandMultiple
            underlayColor='transparent'
            sectionContainerStyle={{backgroundColor: backgroundColor, borderBottomWidth: 1, borderBottomColor: 'lightgray'}}
            activeSections={toJS(unfoldedPreferencesScenePanels)}
            renderHeader={section => this._renderHeader(section, rowBackgroundColor)}
            renderContent={this._renderContent}
            onChange={this._updateSections}
          />
          <View style={{paddingLeft: 8}}>
            <DocumentFeedFilterRow
              title='Restore in-app purchases (ad removal)'
              onPress={this.restoreInAppPurchases}
              backgroundColor='transparent'
              textColor={textColor}
              iconComponent={
                <MaterialCommunityIcon
                  name='cart'
                  style={{fontSize: 24, color: 'gray'}}
                />
              }
            />
            <DocumentFeedFilterRow
              title='Privacy Policy'
              onPress={() => Linking.openURL('http://www.tangoristo.com/privacy-policy/')}
              backgroundColor='transparent'
              textColor={textColor}
              iconComponent={
                <MaterialCommunityIcon
                  name='file-document-outline'
                  style={{fontSize: 24, color: 'gray'}}
                />
              }
            />
          </View>
        </ScrollView>
        {this.state.toastMessage &&
        <MessageToast
          text={this.state.toastMessage}
          color='black'
          backgroundColor='#F9E8B8'
          borderWidth={2}
          borderColor='#EFBA60'
          fadeOutInMillis={this.state.toastDurationInMillis}
        />
        }
        <AdBanner />
      </SafeAreaView>
    )
  }
});

export default preferencesScene;