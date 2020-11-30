/**
 * @flow
 */

import { StyleSheet, Dimensions, TouchableOpacity, View } from 'react-native';
import React from 'react';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import type { AudioTrack } from '../service/AudioPlayer';
import AudioPlayer from '../service/AudioPlayer';
import * as Progress from 'react-native-progress';

type Props = {
  audioTrack: AudioTrack,
  textColor: string
};

type State = {
  audioPlayer: AudioPlayer,
  isReady: boolean
};


const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-end'
  }
});

export default class AudioPlayerBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      audioPlayer: new AudioPlayer(props.audioTrack, this.onReady, this.onProgressUpdate),
      isReady: false
    };
  }

  componentDidMount() {
    this.state.audioPlayer.play();
  }

  componentWillUnmount() {
    this.state.audioPlayer.close();
  }

  onReady = () => {
    this.setState({isReady: true}, () => this.state.audioPlayer.play());
  };

  onProgressUpdate = () => {
    this.forceUpdate();
  };

  render () {
    const iconStyle = {fontSize: 30, color: this.props.textColor};
    const progress = this.state.audioPlayer.audioProgressPercentage
        ? this.state.audioPlayer.audioProgressPercentage / 100
        : 0;
    const enableStop = this.state.audioPlayer.isPaused() || this.state.audioPlayer.isPlaying();
    return (
      <View style={styles.container}>
        <Progress.Bar
          progress={progress}
          indeterminate={!this.state.isReady}
          borderRadius={0}
          height={5}
          width={Dimensions.get('window').width}
        />
        {this.state.isReady &&
        <View style={{flexDirection: 'row', marginTop: 5}}>
          <TouchableOpacity
              style={{
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={!enableStop}
              onPress={() => {
                this.state.audioPlayer.stop();
                this.forceUpdate();
              }}
          >
            <MaterialCommunityIcon
                name={'stop-circle-outline'}
                style={[iconStyle, {
                  color: enableStop ? this.props.textColor : 'gray'
                }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => {
              this.state.audioPlayer.isPlaying()
                ? this.state.audioPlayer.pause()
                : this.state.audioPlayer.play();
              this.forceUpdate();
            }}
          >
            <MaterialCommunityIcon
              name={this.state.audioPlayer.isPlaying() ? 'pause-circle-outline' : 'play-circle-outline'}
              style={iconStyle}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => {
              this.state.audioPlayer.changePosition(-10)
            }}
          >
            <MaterialIcon
              name={'replay-10'}
              style={iconStyle}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{width: 50, height: 50, alignItems: 'center', justifyContent: 'center'}}
            onPress={() => {
              this.state.audioPlayer.changePosition(+10)
            }}
          >
            <MaterialIcon
              name={'forward-10'}
              style={iconStyle}
            />
          </TouchableOpacity>
        </View>
        }
      </View>
    )
  }
}