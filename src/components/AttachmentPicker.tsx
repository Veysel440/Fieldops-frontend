import React, { useState } from 'react';
import { View, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


export default function AttachmentPicker({ onPicked }: { onPicked: (uri: string, name: string, mime: string) => void }) {
  const [uri, setUri] = useState<string | undefined>();
  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled && res.assets?.[0]) {
      const a = res.assets[0];
      const name = a.fileName || 'photo.jpg';
      const mime = a.mimeType || 'image/jpeg';
      setUri(a.uri);
      onPicked(a.uri, name, mime);
    }
  };
  return (
    <View style={{ gap: 8 }}>
      <Button title='Pick Photo' onPress={pick} />
      {uri && <Image source={{ uri }} style={{ width: 120, height: 120 }} />}
    </View>
  );
}