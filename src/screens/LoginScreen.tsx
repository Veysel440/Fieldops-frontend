import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { z } from 'zod';
import { login } from '../api/workorders';
import { useAuth } from '../store/auth';


const schema = z.object({ email: z.string().email(), password: z.string().min(4) });


export default function LoginScreen() {
  const [email, setEmail] = useState('admin@fieldops.local');
  const [password, setPassword] = useState('Passw0rd!');
  const setAuth = useAuth((s) => s.setAuth);


  const onSubmit = async () => {
    const val = schema.safeParse({ email, password });
    if (!val.success) return Alert.alert('Validation', 'Check credentials');
    try {
      const res = await login(email, password);
      await setAuth(res.token, res.user);
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.message || 'Error');
    }
  };


  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text>Email</Text>
      <TextInput autoCapitalize='none' value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 8 }} />
      <Text>Password</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 8 }} />
      <Button title='Sign in' onPress={onSubmit} />
    </View>
  );
}