import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export async function choosePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
  // On web the picker must open in the same click event, before any awaited permission request.
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) throw new Error('Allow photo access to choose an image.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [4, 3] });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if ((asset.fileSize || 0) > 3 * 1024 * 1024) throw new Error('Choose an image under 3 MB.');
  return asset;
}

export function photoForm(asset: ImagePicker.ImagePickerAsset): FormData {
  const form = new FormData();
  if (Platform.OS === 'web' && asset.file) form.append('image', asset.file, asset.fileName || 'photo.jpg');
  else form.append('image', { uri: asset.uri, name: asset.fileName || 'photo.jpg', type: asset.mimeType || 'image/jpeg' } as any);
  return form;
}
