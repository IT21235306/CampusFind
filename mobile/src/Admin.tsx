import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Claim, Item, imageUri, itemDate, request } from './api';
import { showAlert } from './AlertHost';
import { C, shadow } from './theme';

type AdminUser = { _id: string; name: string; email: string; role: 'member' | 'admin'; isActive?: boolean; avatarUrl?: string; createdAt: string };
type AdminItem = Item & { isHidden?: boolean; postedBy: { _id: string; name: string; email: string } };
type AdminClaim = Claim & { claimantId: { _id: string; name: string; email: string } };
type Counts = { users: number; items: number; pendingClaims: number; hiddenItems: number };
type Section = 'Users' | 'Items' | 'Claims';

export function Admin({ token, selfId }: { token: string; selfId: string }) {
  const [section, setSection] = useState<Section>('Users');
  const [counts, setCounts] = useState<Counts | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const [overview, people, found, requests] = await Promise.all([
        request<Counts>('/admin/overview', token),
        request<{ users: AdminUser[] }>('/admin/users', token),
        request<{ items: AdminItem[] }>('/admin/items', token),
        request<{ claims: AdminClaim[] }>('/admin/claims', token),
      ]);
      setCounts(overview); setUsers(people.users); setItems(found.items); setClaims(requests.claims);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }, [token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  async function change(path: string, body: object, success: string) {
    try { await request(path, token, { method: 'PATCH', body: JSON.stringify(body) }); await load(); showAlert('Updated', success); }
    catch (e: any) { showAlert('Action failed', e.message); }
  }
  function confirm(title: string, body: string, path: string, data: object, success: string) {
    showAlert(title, body, [{ text: 'Cancel' }, { text: 'Continue', onPress: () => change(path, data, success) }]);
  }
  const matches = (value: string) => value.toLowerCase().includes(query.trim().toLowerCase());
  return <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <View style={s.heading}><View><Text style={s.eyebrow}>CAMPUSFIND CONTROL</Text><Text style={s.title}>Admin dashboard</Text><Text style={s.sub}>Keep the campus community safe and organized.</Text></View><Pressable onPress={load} accessibilityRole="button" accessibilityLabel="Refresh dashboard" style={s.refresh}><Ionicons name="refresh" size={22} color={C.blue} /></Pressable></View>
    {counts && <View style={s.stats}><Stat icon="people-outline" label="Users" value={counts.users} /><Stat icon="cube-outline" label="Items" value={counts.items} /><Stat icon="time-outline" label="Pending claims" value={counts.pendingClaims} /><Stat icon="eye-off-outline" label="Hidden items" value={counts.hiddenItems} /></View>}
    <View style={s.sections}>{(['Users', 'Items', 'Claims'] as Section[]).map(value => <Pressable key={value} onPress={() => { setSection(value); setQuery(''); }} accessibilityRole="tab" accessibilityState={{ selected: section === value }} style={[s.segment, section === value && s.segmentActive]}><Text style={[s.segmentText, section === value && { color: C.white }]}>{value}</Text></Pressable>)}</View>
    <View style={s.search}><Ionicons name="search-outline" size={20} color={C.blue} /><TextInput style={s.input} value={query} onChangeText={setQuery} placeholder={`Search ${section.toLowerCase()}`} placeholderTextColor={C.muted} accessibilityLabel={`Search ${section.toLowerCase()}`} /></View>
    {error ? <Text style={s.error}>{error}</Text> : busy ? <ActivityIndicator size="large" color={C.blue} style={{ margin: 30 }} /> : section === 'Users' ? users.filter(u => matches(`${u.name} ${u.email}`)).map(u => <View key={u._id} style={s.card}><View style={s.row}>{u.avatarUrl ? <Image source={{ uri: imageUri(u.avatarUrl) }} style={s.avatar} /> : <View style={[s.avatar, s.avatarFallback]}><Text style={s.initial}>{u.name?.[0]?.toUpperCase()}</Text></View>}<View style={{ flex: 1 }}><Text style={s.cardTitle}>{u.name}</Text><Text style={s.cardSub}>{u.email}</Text><Text style={s.meta}>{u.role.toUpperCase()} · {u.isActive === false ? 'Disabled' : 'Active'}</Text></View></View><View style={s.actions}><Action label={u.isActive === false ? 'Enable' : 'Disable'} disabled={u._id === selfId} onPress={() => confirm(`${u.isActive === false ? 'Enable' : 'Disable'} user?`, u.name, `/admin/users/${u._id}`, { isActive: u.isActive === false }, 'User access updated.')} /><Action label={u.role === 'admin' ? 'Remove admin' : 'Make admin'} disabled={u._id === selfId} onPress={() => confirm('Change admin role?', `${u.name} will ${u.role === 'admin' ? 'lose' : 'gain'} admin controls.`, `/admin/users/${u._id}`, { role: u.role === 'admin' ? 'member' : 'admin' }, 'User role updated.')} /></View></View>) : section === 'Items' ? items.filter(i => matches(`${i.title} ${i.foundLocation} ${i.postedBy?.name || ''}`)).map(i => <View key={i._id} style={s.card}><View style={s.row}>{i.imageUrl ? <Image source={{ uri: imageUri(i.imageUrl) }} style={s.itemImage} /> : <View style={[s.itemImage, s.avatarFallback]}><Ionicons name="cube-outline" size={27} color={C.blue} /></View>}<View style={{ flex: 1 }}><Text style={s.cardTitle}>{i.title}</Text><Text style={s.cardSub}>{i.foundLocation} · {i.postedBy?.name || 'Member'}</Text><Text style={s.meta}>{i.status} · {i.isHidden ? 'Hidden' : 'Visible'} · {itemDate(i.createdAt)}</Text></View></View><View style={s.actions}><Action label={i.isHidden ? 'Show item' : 'Hide item'} onPress={() => confirm(`${i.isHidden ? 'Show' : 'Hide'} item?`, i.title, `/admin/items/${i._id}`, { isHidden: !i.isHidden }, 'Item visibility updated.')} /></View></View>) : claims.filter(c => matches(`${typeof c.itemId === 'string' ? '' : c.itemId?.title || ''} ${c.claimantId?.name || ''}`)).map(c => <View key={c._id} style={s.card}><View style={s.row}><View style={[s.avatar, s.avatarFallback]}><Ionicons name="receipt-outline" size={25} color={C.blue} /></View><View style={{ flex: 1 }}><Text style={s.cardTitle}>{typeof c.itemId === 'string' ? 'Found item' : c.itemId?.title || 'Removed item'}</Text><Text style={s.cardSub}>Claimed by {c.claimantId?.name || 'Member'}</Text><Text style={s.meta}>{c.status} · {itemDate(c.createdAt)}</Text></View></View><Text style={s.details}>{c.identifyingDetails}</Text>{c.status === 'Pending' && <View style={s.actions}><Action label="Reject claim" onPress={() => confirm('Reject claim?', 'The claimant will see this decision in My Claims.', `/admin/claims/${c._id}`, { status: 'Rejected' }, 'Claim rejected.')} /></View>}</View>)}
    {!busy && !error && <Text style={s.footer}>Showing the 200 most recent {section.toLowerCase()}.</Text>}
  </ScrollView>;
}
function Stat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number }) { return <View style={s.stat}><Ionicons name={icon} size={23} color={C.blue} /><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>; }
function Action({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) { return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [s.action, disabled && { opacity: .4 }, pressed && { opacity: .7 }]}><Text style={s.actionText}>{label}</Text></Pressable>; }
const s = StyleSheet.create({ page: { flex: 1, backgroundColor: C.bg }, content: { paddingHorizontal: 20, paddingTop: 26, paddingBottom: 40, width: '100%', maxWidth: 1000, alignSelf: 'center' }, heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, eyebrow: { color: C.orangeText, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 }, title: { color: C.navy, fontSize: 28, fontWeight: '900', marginTop: 5 }, sub: { color: C.muted, fontSize: 14, marginTop: 4, maxWidth: 520 }, refresh: { minWidth: 48, minHeight: 48, backgroundColor: C.bluePale, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 23 }, stat: { flexGrow: 1, flexBasis: 135, backgroundColor: C.white, borderRadius: 18, padding: 15, minHeight: 112, ...shadow }, statValue: { color: C.navy, fontSize: 23, fontWeight: '900', marginTop: 7 }, statLabel: { color: C.muted, fontSize: 12, marginTop: 1 }, sections: { flexDirection: 'row', backgroundColor: C.bluePale, borderRadius: 16, padding: 4, gap: 4, marginTop: 24 }, segment: { flex: 1, minHeight: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }, segmentActive: { backgroundColor: C.blue }, segmentText: { color: C.navy, fontSize: 14, fontWeight: '800' }, search: { backgroundColor: C.white, borderColor: C.line, borderWidth: 1, borderRadius: 15, minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, marginVertical: 18 }, input: { flex: 1, color: C.text, fontSize: 15, minHeight: 48 }, error: { color: C.danger, marginBottom: 20 }, card: { backgroundColor: C.white, borderRadius: 18, padding: 16, marginBottom: 12, ...shadow }, row: { flexDirection: 'row', gap: 12, alignItems: 'center' }, avatar: { width: 52, height: 52, borderRadius: 17 }, avatarFallback: { backgroundColor: C.bluePale, alignItems: 'center', justifyContent: 'center' }, itemImage: { width: 62, height: 62, borderRadius: 13 }, initial: { color: C.blue, fontSize: 22, fontWeight: '900' }, cardTitle: { color: C.navy, fontSize: 16, fontWeight: '800' }, cardSub: { color: C.muted, fontSize: 12, marginTop: 2 }, meta: { color: C.orangeText, fontSize: 11, fontWeight: '800', marginTop: 6 }, details: { color: C.text, fontSize: 13, lineHeight: 20, backgroundColor: C.bg, padding: 12, borderRadius: 12, marginTop: 12 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }, action: { minHeight: 44, borderRadius: 12, paddingHorizontal: 14, backgroundColor: C.bluePale, alignItems: 'center', justifyContent: 'center' }, actionText: { color: C.blue, fontWeight: '800', fontSize: 13 }, footer: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 14 } });
