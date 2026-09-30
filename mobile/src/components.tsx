import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, shadow } from './theme';
import { Item, itemDate, imageUri } from './api';

export function Button({ title, onPress, kind = 'primary', loading = false, disabled = false, icon }: { title: string; onPress: () => void; kind?: 'primary' | 'secondary' | 'ghost' | 'danger'; loading?: boolean; disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: disabled || loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, kind === 'secondary' && styles.secondary, kind === 'ghost' && styles.ghost, kind === 'danger' && styles.danger, (disabled || loading) && { opacity: .5 }, pressed && { opacity: .78 }]}>
    {loading ? <ActivityIndicator color={kind === 'primary' || kind === 'danger' ? C.white : C.blue} /> : <>{icon && <Ionicons name={icon} size={19} color={kind === 'primary' || kind === 'danger' ? C.white : C.blue} style={{ marginRight: 8 }} />}<Text style={[styles.buttonText, kind !== 'primary' && kind !== 'danger' && { color: C.blue }]}>{title}</Text></>}
  </Pressable>;
}
export function IconButton({ icon, label, onPress, color = C.navy }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; color?: string }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.iconButton, pressed && { backgroundColor: C.bluePale }]}><Ionicons name={icon} size={23} color={color} /></Pressable>;
}
export function Field({ label, value, onChangeText, error, multiline = false, secureTextEntry = false, keyboardType, placeholder, autoCapitalize, textContentType }: { label: string; value: string; onChangeText: (value: string) => void; error?: string; multiline?: boolean; secureTextEntry?: boolean; keyboardType?: any; placeholder?: string; autoCapitalize?: any; textContentType?: any }) {
  return <View style={{ marginBottom: 17 }}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#788A9B" multiline={multiline} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={autoCapitalize} textContentType={textContentType} style={[styles.input, multiline && { minHeight: 110, textAlignVertical: 'top' }, error && { borderColor: C.danger }]} /><Text style={styles.error}>{error || ' '}</Text></View>;
}
export function Empty({ icon, title, body }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={icon} size={32} color={C.blue} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></View>;
}
export function StatusPill({ status }: { status: string }) { const positive = status === 'Available' || status === 'Approved'; const negative = status === 'Rejected'; return <View style={[styles.pill, { backgroundColor: positive ? C.successPale : negative ? C.dangerPale : C.orangePale }]}><Text style={{ color: positive ? C.success : negative ? C.danger : C.orangeText, fontSize: 12, fontWeight: '700' }}>{status}</Text></View>; }
export function ItemCard({ item, onPress }: { item: Item; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`View ${item.title}, found at ${item.foundLocation}`} style={({ pressed }) => [styles.card, pressed && { opacity: .85 }]}>
    {item.imageUrl ? <Image source={{ uri: imageUri(item.imageUrl) }} style={styles.cardImage} /> : <View style={[styles.cardImage, styles.imageFallback]}><Ionicons name="cube-outline" size={32} color={C.blue} /></View>}
    <View style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}><View><Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text><Text style={styles.cardCategory}>{item.category}</Text></View><View><View style={styles.metaRow}><Ionicons name="location-outline" size={15} color={C.muted} /><Text numberOfLines={1} style={styles.metaText}>{item.foundLocation}</Text></View><Text style={styles.date}>{itemDate(item.foundDate)}</Text></View></View>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 15, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', paddingHorizontal: 18 },
  secondary: { backgroundColor: C.bluePale }, ghost: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line }, danger: { backgroundColor: C.danger },
  buttonText: { color: C.white, fontSize: 15, fontWeight: '700' }, iconButton: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  label: { color: C.navy, fontSize: 14, fontWeight: '700', marginBottom: 8 }, input: { minHeight: 52, backgroundColor: C.white, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 12, color: C.text, fontSize: 16 }, error: { color: C.danger, fontSize: 12, marginTop: 4, minHeight: 15 },
  empty: { alignItems: 'center', padding: 36, marginTop: 28 }, emptyIcon: { width: 76, height: 76, borderRadius: 26, backgroundColor: C.bluePale, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }, emptyTitle: { color: C.navy, fontSize: 19, fontWeight: '800', textAlign: 'center' }, emptyBody: { color: C.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7 },
  pill: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  card: { backgroundColor: C.white, borderRadius: 20, marginBottom: 13, flexDirection: 'row', minHeight: 134, overflow: 'hidden', ...shadow }, cardImage: { width: 118, minHeight: 134 }, imageFallback: { backgroundColor: C.bluePale, alignItems: 'center', justifyContent: 'center' }, cardTitle: { color: C.navy, fontSize: 17, fontWeight: '800', lineHeight: 21 }, cardCategory: { color: C.orangeText, fontSize: 12, fontWeight: '700', marginTop: 5 }, metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 }, metaText: { flex: 1, color: C.muted, fontSize: 12 }, date: { color: C.muted, fontSize: 11, marginTop: 5 },
});
