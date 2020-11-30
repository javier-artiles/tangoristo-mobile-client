/**
 * @flow
 */

import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Image
} from 'react-native';
import type { VocabularyEntry } from '../service/ExternalDocumentService';
import tsvExportService from '../service/TsvExportService';
import ankiExportService from '../service/AnkiExportService';
import SwitchSelector from 'react-native-switch-selector';
import SimpleNavBar from '../component/SimpleNavBar';
import { observer } from 'mobx-react/native';
import styleStore from '../store/StyleStore';
import globalPreferencesStore from '../store/GlobalPreferencesStore';
import AdBanner from '../component/AdBanner';
import { isEmail } from '../util/validation';
import { Actions } from 'react-native-router-flux';

type Props = {
  vocabulary: VocabularyEntry[],
  title: string,
  url: string
}

type State = {
  useTsv: boolean,
  useAnki: boolean,
  destinationEmail: string,
  selectedFrontField: string,
  selectedBackField: string,
  exporting: boolean
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginTop: 20,
    marginLeft: 20,
    fontWeight: 'bold',
    color: '#AAAAAA',
    fontSize: 17
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 5,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: 'grey'
  },
  row: {
    marginTop: 15,
    paddingBottom: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowBottomLine: {
    borderBottomWidth: 0.5,
    borderColor: 'grey'
  },
  text: {
    paddingLeft: 10,
    fontSize: 20
  }

});

const ankiCardSideOptions = [
  { label: 'Kanji', value: 'kanji'},
  { label: 'Kana', value: 'kana'},
  { label: 'K&K', value: 'kanji_and_kana'},
  { label: 'English', value: 'english'}
];

const progressIndicator = require('../../img/text-loading.gif');

const vocabularyExportScene = observer(class VocabularyExportScene extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      useTsv: globalPreferencesStore.exportFormat === 'tsv',
      useAnki: globalPreferencesStore.exportFormat === 'anki',
      selectedFrontField: globalPreferencesStore.exportCardFront,
      selectedBackField: globalPreferencesStore.exportCardBack,
      destinationEmail: globalPreferencesStore.exportDestinationEmail,
      exporting: false
    };
  }

  handleExportPress = () => {
    this.setState({exporting: true});
    const {destinationEmail} = this.state;
    if (isEmail(destinationEmail)) {
      if (this.state.useAnki) {
        this.handleAnkiExportPress();
      } else {
        this.handleTsvExportPress();
      }
    } else {
      Alert.alert('Invalid email address',
        `The email address '${destinationEmail}' is invalid. Please fix it before exporting.`)
    }
  };

  handleTsvExportPress = () => {
    tsvExportService.export(this.props.vocabulary, this.props.title, this.props.url, this.state.destinationEmail)
      .then(() => {
        Alert.alert('TSV file exported!',
          `Your tab separated vocabulary file has been sent to ${this.state.destinationEmail}`,
            [{text: 'OK', onPress: Actions.pop}],
          { cancelable: false }
        );
        this.updateExportDefaults();
      })
      .catch(error => {
        console.log('Failed to handle TSV export', error);
        Alert.alert('Oops, failed to export the TSV file',
          JSON.stringify(error.message));
      })
      .finally(() => this.setState({exporting: false}));
  };

  handleAnkiExportPress = () => {
    const {selectedFrontField, selectedBackField, destinationEmail} = this.state;
    ankiExportService.export(this.props.vocabulary, selectedFrontField, selectedBackField, this.props.title, this.props.url, destinationEmail)
      .then(() => {
        Alert.alert('Anki deck exported!',
          `Your Anki vocabulary deck file has been sent to ${this.state.destinationEmail}`,
            [{text: 'OK', onPress: Actions.pop}],
          { cancelable: false }
          );
        this.updateExportDefaults();
      })
      .catch(error => {
        console.log('Failed to handle Anki export', error);
        Alert.alert('Oops, failed to export the Anki deck',
          JSON.stringify(error.message));
      })
      .finally(() => this.setState({exporting: false}));
  };

  updateExportDefaults() {
    const exportFormat = this.state.useAnki ? 'anki' : 'tsv';
    globalPreferencesStore.setExportFormat(exportFormat);
    globalPreferencesStore.setExportDestinationEmail(this.state.destinationEmail);
    globalPreferencesStore.setExportCardFront(this.state.selectedFrontField);
    globalPreferencesStore.setExportCardBack(this.state.selectedBackField);
  }

  toggleFormat(useTsv: boolean, useAnki: boolean) {
    this.setState({useTsv, useAnki});
  }

  renderFormatSection(backgroundColor, textColor) {
    return (
      <View>
        <Text style={styles.sectionHeader}>FORMAT</Text>
        <View style={[styles.sectionContainer, {backgroundColor}]}>
          <View style={[styles.row, styles.rowBottomLine]}>
            <Text style={[styles.text, {color: textColor}]}>
              Tab separated values
            </Text>
            <Switch
              onValueChange={(value) => this.toggleFormat(value, !value)}
              value={this.state.useTsv}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.text, {color: textColor}]}>
              Anki deck (apkg file)
            </Text>
            <Switch
              onValueChange={(value) => this.toggleFormat(!value, value)}
              value={this.state.useAnki}
            />
          </View>
        </View>
      </View>
    );
  }

  renderEmailSection(backgroundColor, textColor) {
    return (
      <View>
        <Text style={styles.sectionHeader}>EMAIL</Text>
        <View style={[styles.sectionContainer, {backgroundColor}]}>
          <View style={styles.row}>
            <TextInput
              style={{
                flex: 1,
                fontSize: 18,
                paddingLeft: 10,
                color: textColor
              }}
              placeholder={'Destination email address'}
              onChangeText={(destinationEmail) => this.setState({destinationEmail})}
              value={this.state.destinationEmail}
              multiline={false}
              autoFocus={false}
              autoCorrect={false}
              //maxLength={maxLength}
              //underlineColorAndroid={'transparent'}
            />
          </View>
        </View>
      </View>
    )
  }

  renderAnkiOptions(backgroundColor, switchBackgroundColor, textColor) {
    console.log(this.state.selectedFrontField);
    return (
      <View>
        <Text style={styles.sectionHeader}>ANKI DECK</Text>
        <View style={[styles.sectionContainer, {backgroundColor}]}>
          <View style={[styles.row, styles.rowBottomLine, {flexDirection: 'column'}]}>
            <Text style={{fontWeight: 'bold', marginBottom: 10, color: textColor}}>
              Card Front
            </Text>
            <SwitchSelector
              initial={ankiCardSideOptions.findIndex(opt => opt.value === this.state.selectedFrontField)}
              onPress={value => this.setState({selectedFrontField: value})}
              textColor={textColor}
              backgroundColor={switchBackgroundColor}
              selectedColor='white'
              buttonColor='#2ecc71'
              fontSize={18}
              hasPadding
              options={ankiCardSideOptions} />
          </View>
          <View style={[styles.row, {flexDirection: 'column'}]}>
            <Text style={{fontWeight: 'bold', marginBottom: 10, color: textColor}}>
              Card Back
            </Text>
            <SwitchSelector
              initial={ankiCardSideOptions.findIndex(opt => opt.value === this.state.selectedBackField)}
              onPress={value => this.setState({selectedBackField: value})}
              textColor={textColor}
              backgroundColor={switchBackgroundColor}
              selectedColor='white'
              buttonColor='#2ecc71'
              fontSize={18}
              hasPadding
              options={ankiCardSideOptions} />
          </View>
        </View>
      </View>
    );
  }

  renderTsvOptions(backgroundColor, textColor) {
    return null;
  }

  renderExportButton(backgroundColor) {
    return (
      <View>
        <View style={[styles.sectionContainer, {backgroundColor}]}>
          <TouchableOpacity
            onPress={this.handleExportPress}
            disabled={this.state.exporting}
          >
            <View style={[styles.row, {justifyContent: 'center'}]}>
              <View
                style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
              >
                {!this.state.exporting &&
                <Text
                  style={{color: '#2980b9', fontWeight: 'bold', fontSize: 18, opacity: 0.9}}
                >
                  Email exported file
                </Text>
                }
                {this.state.exporting &&
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{color: 'grey', fontWeight: 'bold', fontSize: 18, opacity: 0.9}}
                  >
                    Exporting
                  </Text>
                  <Image
                    source={progressIndicator}
                    style={{width: 25, height: 25}}
                  />
                </View>
                }
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  render() {
    const { darkModeEnabled } = globalPreferencesStore;
    const backgroundColor = darkModeEnabled ? 'black' : '#f0f0f0';
    const statusBackgroundColor = darkModeEnabled ? '#141414' : 'white';
    const textColor = styleStore.getTextColor(darkModeEnabled);
    const rowBackgroundColor = darkModeEnabled ? '#323232' : 'white';

    return (
      <View style={{flex: 1}}>
        <SafeAreaView style={{ flex: 0, backgroundColor: statusBackgroundColor }} />
        <SafeAreaView
          style={{
            backgroundColor,
            flex: 1
          }}
        >
          <StatusBar
            barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
          />
          <SimpleNavBar
            title='Export vocabulary'
            textColor={textColor}
            backgroundColor={statusBackgroundColor}
          />
          <ScrollView style={{flex: 1}}>
            {this.renderEmailSection(rowBackgroundColor, textColor)}
            {this.renderFormatSection(rowBackgroundColor, textColor)}
            {this.state.useAnki && this.renderAnkiOptions(rowBackgroundColor, backgroundColor, textColor)}
            {this.state.useTsv && this.renderTsvOptions(rowBackgroundColor, textColor)}
            {this.renderExportButton(rowBackgroundColor)}
          </ScrollView>
          <AdBanner />
        </SafeAreaView>
      </View>
    );
  }
});

export default vocabularyExportScene;