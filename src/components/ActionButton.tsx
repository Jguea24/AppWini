import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
};

export function ActionButton({ label, onPress, variant = 'primary' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.base, variant === 'ghost' ? styles.ghost : styles.primary]}
    >
      <Text style={[styles.text, variant === 'ghost' ? styles.textGhost : styles.textPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 110,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#0f172a',
  },
  ghost: {
    borderWidth: 1,
    borderColor: '#0f172a',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: '#f8fafc',
  },
  textGhost: {
    color: '#0f172a',
  },
});
