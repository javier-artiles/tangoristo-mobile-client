import type {LinkedText} from "../service/ExternalDocumentService";

const isBoundary = (substring: string) => {
    return substring.indexOf('\n') >= 0 || substring.indexOf('。') >= 0 ;
};

export const getSentence = (linkedSubstring, linkedText: LinkedText) => {
    try {
        let linkedSubstringIndex = linkedText.indexOf(linkedSubstring);
        let startIndex = linkedSubstringIndex;
        // Take one step back if selecting from the boundary itself
        if (isBoundary(linkedText[startIndex].surfaceList.join(''))) {
            startIndex--;
        }
        while (startIndex > 0) {
            if (isBoundary(linkedText[startIndex - 1].surfaceList.join(''))) {
                break;
            } else {
                startIndex--;
            }
        }

        let endIndex = linkedSubstringIndex;
        while (endIndex < linkedText.length) {
            if (isBoundary(linkedText[endIndex].surfaceList.join(''))) {
                break;
            } else {
                endIndex++;
            }
        }

        let sentence = linkedText.slice(startIndex, endIndex + 1).map(lt => lt.surfaceList.join('')).join('');
        return sentence.trim();

    } catch(error) {
        console.log('Failed to get sentence from linked substring', linkedSubstring, error);
        return '';
    }
};