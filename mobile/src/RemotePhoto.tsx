import React, { useEffect, useState } from 'react';
import { Image, ImageStyle, Platform, StyleProp, View } from 'react-native';
import { C } from './theme';

export function Photo({ uri, style }: { uri: string; style: StyleProp<ImageStyle> }) {
  const [webUri, setWebUri] = useState('');
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const controller = new AbortController();
    let objectUrl = '';
    fetch(uri, { mode: 'cors', signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Photo unavailable'); return response.blob(); })
      .then(blob => { if (!controller.signal.aborted) { objectUrl = URL.createObjectURL(blob); setWebUri(objectUrl); } })
      .catch(() => { if (!controller.signal.aborted) setWebUri(''); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [uri]);
  const source = Platform.OS === 'web' ? webUri : uri;
  return source ? <Image source={{ uri: source }} style={style} /> : <View style={[style, { backgroundColor: C.bluePale }]} />;
}
