import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { WorkOrder } from '../api/workorders';


export default function WorkOrderItem({ item, onPress }: { item: WorkOrder; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ padding: 12, borderBottomWidth: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '600' }}>{item.code}</Text>
        <Text>{item.status}</Text>
      </View>
      <Text>{item.title}</Text>
      {!!item.customer?.name && <Text style={{ color: '#666' }}>{item.customer.name}</Text>}
    </Pressable>
  );
}