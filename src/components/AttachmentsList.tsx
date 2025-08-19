import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listAttachments, type Attachment } from '../api/workorders';

type Props = { workOrderId: number };

export default function AttachmentsList({ workOrderId }: Props) {
  const q = useQuery({
    queryKey: ['wo', workOrderId, 'attachments'] as const,
    queryFn: () => listAttachments(workOrderId),
    staleTime: 15_000,
  });

  const items: Attachment[] = q.data?.data ?? [];

  return (
    <View style={{ gap: 8 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', gap: 12 }}>
            {item.mime?.startsWith('image/') ? (
              <Image source={{ uri: item.url }} style={{ width: 72, height: 72, borderRadius: 8 }} />
            ) : (
              <View style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' }}>
                <Text>FILE</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1}>{item.original_name ?? 'Attachment'}</Text>
              <Text style={{ color: '#666', fontSize: 12 }}>{item.mime}</Text>
              {!!item.scanned_at && (
                <Text style={{ color: item.is_malicious ? '#b00' : '#0a0', fontSize: 12 }}>
                  {item.is_malicious ? 'Malicious' : 'Scanned OK'}
                </Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !q.isLoading ? <Text style={{ padding: 12 }}>Ek yok.</Text> : null
        }
      />
    </View>
  );
}