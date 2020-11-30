/**
 * @flow
 */

import Tts from 'react-native-tts';
import { Platform, NativeEventEmitter, NativeModules } from 'react-native';

const defaultLanguage = 'ja-JP';
const defaultIosVoiceId = 'com.apple.ttsbundle.Kyoko-compact';

export type Voice = {
  id: string,
  networkConnectionRequired: boolean,
  quality: number,
  name: string,
  notInstalled: ?boolean
}

Tts.getInitStatus().then(() => {
  Tts.setDefaultLanguage(defaultLanguage);
  const ee = new NativeEventEmitter(NativeModules.TextToSpeech);
  ee.addListener('tts-start', () => {});
  ee.addListener('tts-finish', () => {});
  ee.addListener('tts-cancel', () => {});
});

export function speak(text, voiceId = null) {
  console.log('speak', text);
  Tts.getInitStatus().then(() => {
    const configuration = {iosVoiceId: defaultIosVoiceId};
    if (voiceId) {
      if (Platform.OS === 'ios') {
        configuration.iosVoiceId = voiceId;
      } else {
        Tts.setDefaultVoice(voiceId);
      }
    }
    Tts.speak(text, configuration);
  });
}

export function getAvailableVoices(language = defaultLanguage) {
  return Tts.voices()
    .then((voices: Voice[]) => voices.filter(voice => {
      if (Platform.OS === 'android' && voice.notInstalled) {
        return false;
      }
      return voice['language'] && voice['language'] === language;
    }).sort((voice1, voice2) => voice1.id.localeCompare(voice2.id)));
}
