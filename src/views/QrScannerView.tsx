import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { useQrViewModel } from '../viewmodels/useQrViewModel';

export function QrScannerView() {
  const { lastCode, simulateScan } = useQrViewModel();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escaner QR</Text>
      <View style={styles.cameraBox}>
        <Text style={styles.cameraText}>Vista previa de camara</Text>
      </View>
      <ActionButton label="Simular lectura" onPress={simulateScan} />
      {lastCode ? <Text style={styles.code}>Codigo: {lastCode}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  cameraBox: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  cameraText: {
    color: '#64748b',
  },
  code: {
    fontWeight: '600',
    color: '#0f172a',
  },
});
