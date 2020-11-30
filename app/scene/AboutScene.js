/**
 * @flow
 */

import React from 'react';
import {
  ScrollView,
  SafeAreaView,
  StatusBar,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  View
} from 'react-native';
import { observer } from 'mobx-react/native';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';
import styleStore from '../store/StyleStore';
import SimpleNavBar from '../component/SimpleNavBar';
import FeatherIcon from 'react-native-vector-icons/Feather';


type Props = {
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {}

const styles = StyleSheet.create({
  sectionHeader: {
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#9b9b9b',
    fontSize: 17
  },
  text: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 6,
    fontSize: 20
  }
});

const aboutScene = observer(class PreferencesScene extends React.Component<Props, State> {
  render () {
    const { darkModeEnabled } = this.props.globalPreferencesStore;
    const rowBackgroundColor = darkModeEnabled ? '#323232' : 'white';
    const textColor = styleStore.getTextColor(darkModeEnabled);
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
          title='About'
          textColor={textColor}
        />
        <ScrollView>
          <Text style={styles.sectionHeader}>
            ABOUT ME
          </Text>
          <Text style={[styles.text, {color: textColor}]}>
            Tangoristo was built by me (Javier Artiles), mostly during my daily train ride to work.
          </Text>
          <Text style={[styles.text, {color: textColor}]}>
            TangoRisto analyzes short Japanese texts from the web to facilitate your reading flow. This app encourages you to read and explore the vocabulary in short texts from the Web. You can review the vocabulary for each text, filter it by your reading level and bookmark your favorite articles.
          </Text>
          <Text style={[styles.text, {color: textColor}]}>
            I find more often than not real learning breakthroughs happen when observing language in context. Hopefully this app will help you to take the knowledge you are acquiring in class or through standard learning materials, and apply it to read real texts.
          </Text>
          <Text style={styles.sectionHeader}>
            ACKNOWLEDGEMENTS
          </Text>
          <Text style={[styles.text, {color: textColor}]}>
            Tangoristo would not have been possible without JMdict and JMnedict.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('http://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project')}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                textDecorationLine={'underline'}
                style={[styles.text, {marginRight: 4, color: '#2980b9'}]}
              >
                JMDict
              </Text>
              <FeatherIcon
                name='external-link'
                style={{color: '#2980b9', fontSize: 12}}
              />
            </View>
          </TouchableOpacity>
          <Text style={[styles.text, {color: textColor}]}>
            Created by Jim Breen and now managed by the Electronic Dictionary Research and Development Group (EDRDG), is a great general dictionary with roughly 170,000 entries and is actively maintained by Jim Breen and a team of volunteers.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('http://www.edrdg.org/enamdict/enamdict_doc.html')}
          >
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text
                textDecorationLine={'underline'}
                style={[styles.text, {marginRight: 4, color: '#2980b9'}]}
              >
                JMnedict
              </Text>
              <FeatherIcon
                name='external-link'
                style={{color: '#2980b9', fontSize: 12}}
              />
            </View>
          </TouchableOpacity>
          <Text style={[styles.text, {color: textColor}]}>
            Also from Jim Breen/EDRDG, is an immense database of Japanese proper names for people, companies and locations.
          </Text>
        </ScrollView>
      </SafeAreaView>
    )
  }
});

export default aboutScene;
