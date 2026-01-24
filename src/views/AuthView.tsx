import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

const ROLES = [
  { id: 'cliente', label: 'Cliente' },
  { id: 'admin', label: 'Admin' },
  { id: 'operaciones', label: 'Operaciones' },
];

export function AuthView() {
  const { mode, loading, toggleMode, submit, user, error, role, setRole, logout } = useAuthViewModel();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => submit({ name, email, password });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'login' ? 'Bienvenido' : 'Crear cuenta'}</Text>
      <Text style={styles.subtitle}>Autenticacion con rol y token persistente (API real).</Text>

      {mode === 'register' && (
        <TextInput
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      )}
      <TextInput
        placeholder="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {mode === 'register' ? (
        <View style={styles.roleRow}>
          {ROLES.map(r => (
            <ActionButton
              key={r.id}
              label={r.label}
              variant={role === r.id ? 'primary' : 'ghost'}
              onPress={() => setRole(r.id)}
            />
          ))}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ActionButton
        label={loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Registrarme'}
        onPress={handleSubmit}
      />

      <ActionButton
        label={mode === 'login' ? 'Crear cuenta' : 'Ya tengo cuenta'}
        onPress={toggleMode}
        variant="ghost"
      />

      {user ? (
        <View style={styles.sessionBox}>
          <Text style={styles.user}>Sesion: {user.name} ({user.role})</Text>
          <ActionButton label="Cerrar sesion" variant="ghost" onPress={logout} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#64748b',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  error: {
    color: '#dc2626',
    fontWeight: '600',
  },
  sessionBox: {
    marginTop: 12,
    gap: 8,
  },
  user: {
    color: '#0f172a',
    fontWeight: '600',
  },
});
