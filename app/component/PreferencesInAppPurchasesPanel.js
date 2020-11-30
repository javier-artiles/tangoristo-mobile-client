/**
 * @flow
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import billingService from '../service/BillingService';

type Props = {
  textColor: string
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
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  text: {
    paddingLeft: 10,
    fontSize: 20
  },
});

export default class PreferencesInAppPurchasesPanel extends React.Component<Props, State> {
  render () {
    const textColorStyle = {color: this.props.textColor};
    return (
      <View style={[styles.container, {backgroundColor: this.props.backgroundColor}]}>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => {
              billingService.restoreAdRemovalPurchase()
                .then(didPurchase => {
                  if (didPurchase) {
                    Alert.alert("Your purchase has been restored",
                      "You can continue enjoying Tangoristo without ads!");
                  }
                });
            }}
          >
            <Text style={[styles.text, textColorStyle]}>
              Restore in-app purchases
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
