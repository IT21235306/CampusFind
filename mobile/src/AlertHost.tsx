import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, shadow } from './theme';

type Action = { text?: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };
type Message = { title: string; body?: string; buttons: Action[] };
let listener: ((message: Message) => void) | null = null;
let queued: Message[] = [];
export function showAlert(title: string, body?: string, buttons: Action[] = [{ text: 'OK' }]) {
  const message = { title, body, buttons };
  if (listener) listener(message); else queued.push(message);
}
export function AlertHost() {
  const [message, setMessage] = useState<Message | null>(() => queued.shift() || null);
  useEffect(() => {
    listener = setMessage;
    return () => { listener = null; };
  }, []);
  function close(action?: Action) {
    setMessage(queued.shift() || null);
    action?.onPress?.();
  }
  const confirm = (message?.buttons.length || 0) > 1;
  return <Modal visible={!!message} transparent animationType="fade" onRequestClose={() => close(message?.buttons[0])}>
    <View style={s.overlay}><View style={s.card} accessibilityRole="alert">
      <View style={[s.icon, { backgroundColor: confirm ? C.orangePale : C.bluePale }]}><Ionicons name={confirm ? 'help-circle-outline' : 'checkmark-circle-outline'} size={30} color={confirm ? C.orangeText : C.blue} /></View>
      <Text style={s.title}>{message?.title}</Text>{!!message?.body && <Text style={s.body}>{message.body}</Text>}
      <View style={s.actions}>{(message?.buttons || []).map((action, index) => <Pressable key={`${action.text}-${index}`} accessibilityRole="button" onPress={() => close(action)} style={({ pressed }) => [s.button, index === 0 && confirm ? s.secondary : action.style === 'destructive' ? s.destructive : s.primary, pressed && { opacity: 0.8 }]}><Text style={[s.buttonText, index === 0 && confirm && { color: C.blue }]}>{action.text || 'OK'}</Text></Pressable>)}</View>
    </View></View>
  </Modal>;
}
const s = StyleSheet.create({ overlay: { flex: 1, backgroundColor: 'rgba(9,30,54,.55)', alignItems: 'center', justifyContent: 'center', padding: 20 }, card: { width: '100%', maxWidth: 440, backgroundColor: C.white, borderRadius: 24, padding: 24, alignItems: 'center', ...shadow }, icon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }, title: { fontSize: 21, fontWeight: '800', color: C.navy, textAlign: 'center' }, body: { fontSize: 15, lineHeight: 23, color: C.muted, textAlign: 'center', marginTop: 9 }, actions: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 24 }, button: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, primary: { backgroundColor: C.blue }, secondary: { backgroundColor: C.bluePale }, destructive: { backgroundColor: C.danger }, buttonText: { color: C.white, fontSize: 14, fontWeight: '800', textAlign: 'center' } });
