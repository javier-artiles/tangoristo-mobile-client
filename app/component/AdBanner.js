/**
 * @flow
 */

import React from 'react';
import {Dimensions, Linking, TouchableOpacity, View, Platform} from 'react-native';
import billingService from '../service/BillingService';
import { Text } from 'react-native-animatable';
import * as Progress from 'react-native-progress';
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";
import patreonService from "../service/PatreonService";

type Props = {}
type State = {
  showAds: boolean
}

export default class AdBanner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showAds: false,
      fundingGoalProgress: null
    }
  }

  componentDidMount() {
    billingService.didPurchaseAdRemoval().then(didPurchase => this.setState({showAds: !didPurchase}));
    patreonService.getFundingGoalProgress().then(fundingGoalProgress => this.setState({fundingGoalProgress}));
  }

  renderBannerComponent() {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: Platform.OS === 'android' ? 100 : 75,
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: Platform.OS === 'android' ? 0 : 10,
          borderTopWidth: 1,
          borderTopColor: 'gray',
          zIndex: 200
        }}
        onPress={() => Linking.openURL('https://www.patreon.com/tangoristo/')}
      >
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center'

          }}>
          <View style={{marginTop: 8, marginBottom: 8}}>
            <Progress.Bar
              color={'#c0392b'}
              progress={this.state.fundingGoalProgress}
              borderRadius={15}
              height={10}
              width={Dimensions.get('window').width - 80}
            />
          </View>
          <Text
            style={{fontSize: 15}}>
            We've reached
            <Text style={{fontWeight: 'bold'}}>
              &nbsp;{Math.round(this.state.fundingGoalProgress * 100)}%&nbsp;
            </Text>
            of the monthly funding goal.
          </Text>
          <Text style={{fontSize: 15}}>
            Please support this app with your pledge
          </Text>
        </View>
        <MaterialCommunityIcon
          name={'chevron-right'}
          style={{
            marginTop: 5,
            fontSize: 44,
            color: this.props.textColor
          }}
        />
      </TouchableOpacity>
    );
  }

  render() {
    return this.state.showAds && this.state.fundingGoalProgress != null && this.state.fundingGoalProgress < 100
      ? this.renderBannerComponent()
      : null;
  }
}