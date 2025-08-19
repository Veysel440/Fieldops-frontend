import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import WorkOrderListScreen from '../screens/WorkOrderListScreen';
import WorkOrderDetailScreen from '../screens/WorkOrderDetailScreen';
import { useAuth } from '../store/auth';


export type RootStackParamList = {
  Login: undefined;
  WorkOrders: undefined;
  WorkOrderDetail: { id: number };
};


const Stack = createNativeStackNavigator<RootStackParamList>();


export default function RootNavigator() {
  const token = useAuth((s) => s.token);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!token ? (
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in' }} />
) : (
    <>
      <Stack.Screen name="WorkOrders" component={WorkOrderListScreen} options={{ title: 'Work Orders' }} />
  <Stack.Screen name="WorkOrderDetail" component={WorkOrderDetailScreen} options={{ title: 'Details' }} />
  </>
)}
  </Stack.Navigator>
  </NavigationContainer>
);
}