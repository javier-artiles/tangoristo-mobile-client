/**
 * @flow
 */

const timer = require('react-native-timer');
import TrackPlayer from 'react-native-track-player';

/*
TrackPlayer.registerEventHandler(event => {
  return new Promise(function(resolve, reject) {
    console.log(event);
    resolve('');
  });
});
*/

export type AudioTrack = {
  id: string,
  url: string,
  title: string,
  artist: string
}

export default class AudioPlayer {
  CHECK_PROGRESS_INTERVAL_ID = 'checkProgressInterval';
  isPlayerReady: boolean = false;
  playbackState: string =  null;
  audioProgressPercentage: number = null;
  audioTrack: AudioTrack = null;
  onProgressUpdate: () => void = null;

  constructor(audioTrack: AudioTrack, onReady: () => void, onProgressUpdate: () => void) {
    this.audioTrack = audioTrack;
    this.onProgressUpdate = onProgressUpdate;
    console.log('constructor');
    TrackPlayer.reset();
    TrackPlayer.setupPlayer().then(() => {
      console.log('Audio player is ready');
      this.isPlayerReady = true;
      onReady();
    });
  }

  play() {
    console.log('playAudioTrack');
    if (this.isPlayerReady) {
      if (this.audioProgressPercentage === 100) {
        TrackPlayer.seekTo(0);
      }
      TrackPlayer.add(this.audioTrack)
        .then(async () => {
          TrackPlayer.play();
          timer.setInterval(
            this,
            this.CHECK_PROGRESS_INTERVAL_ID,
            () => this.updateProgress(),
            1000
          );
        })
        .catch(error => console.log('Playback error', error));
      this.playbackState = 'STATE_PLAYING';
    } else {
      console.log('audio player is not yet ready');
    }
  }

  updateProgress() {
    //TrackPlayer.getState().then(state => console.log('updateProgress', state));
    TrackPlayer.getPosition().then(positionInSecs => {
      TrackPlayer.getDuration().then(durationInSecs => {
        console.log('updateProgress', durationInSecs, positionInSecs);
        this.audioProgressPercentage = Math.round( (positionInSecs / durationInSecs) * 100);
        if (this.audioProgressPercentage >= 100) {
              this.stop();
        }
        this.onProgressUpdate();
      });
    });
  }

  clearProgressCheckInterval() {
    if (timer.intervalExists(this, this.CHECK_PROGRESS_INTERVAL_ID)) {
      timer.clearInterval(this, this.CHECK_PROGRESS_INTERVAL_ID);
    }
  }

  close() {
    this.clearProgressCheckInterval();
    if (this.isPlaying()) {
      this.stop();
    }
  }

  stop() {
    console.log('stop');
    TrackPlayer.stop();
    TrackPlayer.reset();
    this.playbackState = 'STATE_STOP';
    this.audioProgressPercentage = 0;
    this.clearProgressCheckInterval();
  }

  pause() {
    this.clearProgressCheckInterval();
    TrackPlayer.pause();
    this.playbackState = 'STATE_PAUSED';
  }

  skipForward(seconds) {
    console.log('skipAudioForward');
    this.changePosition(seconds);
  }

  skipBack(seconds) {
    console.log('skipAudioBack');
    this.changePosition(-seconds);
  }

  changePosition(delta) {
    TrackPlayer.getPosition().then(positionInSecs => {
      TrackPlayer.getDuration().then(durationInSecs => {
        console.log('positionInSecs', positionInSecs);
        console.log('durationInSecs', durationInSecs);
        let newPosition = positionInSecs + delta;
        if (newPosition < 0 || newPosition > durationInSecs) {
          newPosition = 0;
        }
        TrackPlayer.seekTo(newPosition);
        this.updateProgress();
      });
    });
  }

  togglePlayPause() {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  isPaused() {
    return this.playbackState === 'STATE_PAUSED';
  }

  isPlaying() {
    return this.playbackState === 'STATE_PLAYING';
  }

}
