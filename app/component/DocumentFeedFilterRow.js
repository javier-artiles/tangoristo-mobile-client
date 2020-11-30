import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';


type Props = {
  title: string,
  subtitle: string,
  backgroundColor: string,
  textColor: string,
  titleSize: number,
  subTitleSize: number,
  minHeight: number,
  onPress: () => {},
  isSelected: boolean,
  badgeCount: ?number,
  iconComponent: ?{},
  paddingLeft: number
}

export default class DocumentFeedFilterRow extends React.Component<Props, State> {
  static defaultProps = {
    backgroundColor: 'white',
    titleSize: 18,
    subTitleSize: 12,
    minHeight: 50,
    paddingLeft: 7,
    subtitle: null,
    badgeCount: null,
    isSelected: false
  };

  render() {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: this.props.backgroundColor,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
          minHeight: this.props.minHeight,
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: this.props.paddingLeft,
          paddingRight: 10,
          flexDirection: 'row',
        }}
        onPress={() => this.props.onPress()}
      >
        <View
          style={{flexDirection: 'row'}}
        >
          <View
            style={{
              backgroundColor: this.props.isSelected ? 'crimson' : 'transparent',
              width: 5
            }}
          />
          {!!this.props.iconComponent &&
          this.props.iconComponent
          }
          <View>
            <Text style={{
              paddingLeft: !!this.props.iconComponent ? 14 : 10,
              fontSize: this.props.titleSize,
              color: this.props.textColor
            }}>
              {this.props.title}
            </Text>
            {this.props.subtitle &&
            <Text style={{fontSize: this.props.subTitleSize, color: this.props.textColor}}>
              {this.props.subtitle}
            </Text>
            }
          </View>
        </View>
        {!!this.props.badgeCount &&
          <View
            style={{backgroundColor: 'grey', alignItems: 'center', padding: 3, minWidth: 25, borderRadius: 20}}
          >
            <Text style={{fontSize: this.props.titleSize * .8, fontWeight: 'bold', color: 'white'}}>
              {this.props.badgeCount}
            </Text>
          </View>
        }
      </TouchableOpacity>
    );
  }
}