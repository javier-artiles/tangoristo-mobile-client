/**
 * @flow
 */

import React from 'react';
import { Platform, Dimensions, SafeAreaView, StyleSheet, TouchableOpacity, Text, Clipboard } from 'react-native';
import { Actions } from 'react-native-router-flux';
import tsvExportService from "../service/TsvExportService";
import type {VocabularyEntry} from "../service/ExternalDocumentService";

type Props = {
  sentence: string,
  text: string,
  surface: string,
  reading: string,
  vocabularyEntry: ?VocabularyEntry
}

type State = {}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'rgba(52,52,52,0.8)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default class WordContextualMenuLightbox extends React.Component<Props, State> {

  getCopyRow(title: string, subtitle: string, textToCopy: string, subtitleNumberOfLines: number = 1) {
    return (
      <TouchableOpacity
        style={{
          width: Math.min(400, Dimensions.get('window').width * 0.8),
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: 15,
          paddingBottom: 20,
          borderRadius: 15,
          marginBottom: 25
        }}
        onPress={() => {
          Clipboard.setString(textToCopy);
          Actions.pop();
        }}
      >
        {title &&
        <Text
          style={{
            fontSize: 18,
            color: 'gray',
            marginBottom: 15
          }}
        >
          {title}
        </Text>
        }
        <Text
          style={{
            fontSize: 16,
            color: 'black'
          }}
          numberOfLines={Platform.OS === 'android' ? 1 : subtitleNumberOfLines}
        >
          {subtitle}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { sentence, text, surface, reading, vocabularyEntry } = this.props;
    const combinedForm = surface && reading
      ? `${surface}【${reading}】`
      : null;
    const vocabularyTsv = vocabularyEntry ? tsvExportService.asExportLine(vocabularyEntry) : null;
    return (
      <TouchableOpacity
        style={styles.shadow}
        onPress={() => Actions.pop()}
      >
        <SafeAreaView style={styles.container}>
          {surface && this.getCopyRow(null, surface, surface)}
          {reading && this.getCopyRow(null, reading, reading)}
          {combinedForm && this.getCopyRow(null, combinedForm, combinedForm)}
          {this.getCopyRow('Sentence', sentence, sentence, 2)}
          {this.getCopyRow('Full Text', text, text, 4)}
          {vocabularyTsv && this.getCopyRow('Export vocabulary entry', vocabularyTsv, vocabularyTsv, 1)}
        </SafeAreaView>
      </TouchableOpacity>
    )
  }
}
