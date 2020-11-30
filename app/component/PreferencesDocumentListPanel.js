/**
 * @flow
 */

import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { observer } from 'mobx-react/native';
import { GlobalPreferencesStore } from '../store/GlobalPreferencesStore';


type Props = {
  textColor: string,
  backgroundColor: string,
  globalPreferencesStore: GlobalPreferencesStore
}

type State = {}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 18,
    paddingRight: 35,
    paddingBottom: 10,
    paddingTop: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  text: {
    paddingLeft: 10,
    fontSize: 20
  }
});

const preferencesDocumentListPanel = observer(class PreferencesDocumentListPanel extends React.Component<Props, State> {
  render() {
    return (
      <View style={[styles.container, {backgroundColor: this.props.backgroundColor}]}>
        <View style={styles.row}>
          <Text style={[styles.text, {color: this.props.textColor}]}>
            Show furigana on title
          </Text>
          <Switch
            onValueChange={(value) => this.props.globalPreferencesStore.setShowFuriganaListOnTitle(value)}
            value={this.props.globalPreferencesStore.showFuriganaListOnTitle}
          />
        </View>
      </View>
    )
  }
});

export default preferencesDocumentListPanel;