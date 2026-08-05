import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Settings, useMeta } from '@/store/useMeta';
import { C } from '@/theme/colors';

const TOGGLES: { key: keyof Settings; label: string }[] = [
  { key: 'sound', label: 'Sound effects' },
  { key: 'music', label: 'Music' },
  { key: 'haptics', label: 'Haptic feedback' },
  { key: 'reduceMotion', label: 'Reduce motion' },
  { key: 'damageNumbers', label: 'Damage numbers' },
  { key: 'colorblind', label: 'Colorblind status icons' },
];

export function SettingsPanel({ showDevSeed }: { showDevSeed?: boolean }) {
  const settings = useMeta(s => s.settings);
  const setSetting = useMeta(s => s.setSetting);
  const devSeed = useMeta(s => s.devSeed);
  const setDevSeed = useMeta(s => s.setDevSeed);

  return (
    <View style={styles.panel}>
      {TOGGLES.map(t => (
        <View key={t.key} style={styles.row}>
          <Text style={styles.label}>{t.label}</Text>
          <Switch
            value={settings[t.key]}
            onValueChange={v => setSetting(t.key, v)}
            trackColor={{ false: '#1e293b', true: C.cyanDim }}
            thumbColor={settings[t.key] ? C.cyan : '#64748b'}
          />
        </View>
      ))}
      {showDevSeed && (
        <View style={styles.row}>
          <Text style={styles.label}>Diagnostics overlay (dev)</Text>
          <Switch
            value={settings.showDiagnostics}
            onValueChange={v => setSetting('showDiagnostics', v)}
            trackColor={{ false: '#1e293b', true: C.cyanDim }}
            thumbColor={settings.showDiagnostics ? C.cyan : '#64748b'}
          />
        </View>
      )}
      {showDevSeed && (
        <View style={styles.seedRow}>
          <Text style={styles.label}>Battle seed (dev)</Text>
          <TextInput
            value={devSeed}
            onChangeText={setDevSeed}
            placeholder="random"
            placeholderTextColor={C.textFaint}
            style={styles.seedInput}
            autoCapitalize="none"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    backgroundColor: C.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: { color: C.text, fontSize: 14, fontWeight: '600' },
  seedRow: { marginTop: 8, gap: 6 },
  seedInput: {
    borderWidth: 1,
    borderColor: C.borderBright,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: C.text,
    fontSize: 13,
    backgroundColor: C.bgPanel,
  },
});
