/**
 * @flow
 */


class StyleStore {
  getContainerBackgroundColor(darkMode: boolean) {
    return darkMode ? 'black' : 'white';
  }

  getContainerBackgroundColorStyle(darkMode: boolean) {
    return {backgroundColor: this.getContainerBackgroundColor(darkMode)};
  }

  getTextColor(darkMode: boolean) {
    return darkMode ? 'white': 'black'
  }

  getTextColorStyle(darkMode: boolean) {
    return {color: this.getTextColor(darkMode)};
  }
}

const styleStore = new StyleStore();
export default styleStore;