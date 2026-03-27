import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Share a text-based result summary
 */
export async function shareTextResult(title: string, message: string) {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      // Create a temporary file to share if needed, or just share simple message
      // Note: On some platforms Sharing only works with files
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // @ts-ignore
        const fileUri = `${FileSystem.cacheDirectory}result.txt`;
        await FileSystem.writeAsStringAsync(fileUri, `${title}\n\n${message}`);
        await Sharing.shareAsync(fileUri);
      } else {
        // Fallback for web or others if sharing is limited
        alert(`Paylaşılacak metin:\n\n${title}\n${message}`);
      }
    } else {
      console.log('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Error sharing:', error);
  }
}

/**
 * Generate a score message for sharing
 */
export function generateShareMessage(score: number, total: number, mode: string) {
  return `YDS Hazırlık uygulamasında ${mode} sınavını tamamladım!\n\nSkorum: ${score}/${total}\nDoğruluk: %${Math.round((score/total)*100)}\n\nSen de YDS'ye hazırlanıyorsan bu uygulamaya göz atmalısın! 🚀`;
}
