import React from 'react';
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import RootNavigator from '../navigation/RootNavigator.tsx';
import { AppState, Platform } from 'react-native';


const qc = new QueryClient();


focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener('change', (state) => {
    if (state === 'active') handleFocus();
  });
  return () => sub.remove();
});


export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <RootNavigator />
    </QueryClientProvider>
  );
}