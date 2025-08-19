import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert, Pressable } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkOrder,
  updateWorkOrder,
  uploadAttachment,
  postComment,
  type WorkOrder,
  type UpdateWorkOrderDto,
} from '../api/workorders';
import AttachmentPicker from '../components/AttachmentPicker';
import CommentsList from '../components/CommentsList';
import AttachmentsList from '../components/AttachmentsList';
import { useRoute, type RouteProp } from '@react-navigation/native';

type RouteP = RouteProp<{ params: { id: number } }, 'params'>;

export default function WorkOrderDetailScreen() {
  const route = useRoute<RouteP>();
  const id = (route.params as any).id as number;

  const qc = useQueryClient();


  const q = useQuery<WorkOrder>({
    queryKey: ['wo', id] as const,
    queryFn: () => getWorkOrder(id),
    staleTime: 15_000,
  });

  const [title, setTitle] = useState('');

  const mu = useMutation({
    mutationFn: (payload: UpdateWorkOrderDto) => updateWorkOrder(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wo', id] });
      Alert.alert('Saved');
    },
  });

  const saveTitle = () => {
    const w = q.data;
    if (!w) return;
    mu.mutate({ title, version: w.version }); // WorkOrder.version mevcut
  };

  const onPicked = async (uri: string, name: string, mime: string) => {
    try {
      await uploadAttachment(id, uri, name, mime);
      qc.invalidateQueries({ queryKey: ['wo', id, 'attachments'] });
      Alert.alert('Uploaded');
    } catch (e: any) {
      Alert.alert('Upload failed', e?.response?.data?.message || 'Error');
    }
  };

  const [comment, setComment] = useState('');
  const sendComment = async () => {
    try {
      await postComment(id, comment);
      setComment('');
      qc.invalidateQueries({ queryKey: ['wo', id, 'comments'] });
      Alert.alert('Comment added');
    } catch {
      Alert.alert('Error', 'Could not add comment');
    }
  };

  const w = q.data;
  const [tab, setTab] = useState<'details' | 'comments' | 'attachments'>('details');

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontWeight: '700', fontSize: 16 }}>{w?.code}</Text>
        <Text>{w?.title}</Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row' }}>
        {(['details', 'comments', 'attachments'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              flex: 1,
              padding: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderColor: tab === t ? '#333' : 'transparent',
            }}
          >
            <Text style={{ fontWeight: tab === t ? '700' : '400' }}>{t.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {tab === 'details' && (
        <View style={{ padding: 16, gap: 12 }}>
          <TextInput
            placeholder="New title"
            value={title}
            onChangeText={setTitle}
            style={{ borderWidth: 1, padding: 8 }}
          />
          <Button title="Save" onPress={saveTitle} />
          <AttachmentPicker onPicked={onPicked} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TextInput
              placeholder="Write a comment"
              value={comment}
              onChangeText={setComment}
              style={{ borderWidth: 1, padding: 8, flex: 1 }}
            />
            <Button title="Send" onPress={sendComment} />
          </View>
        </View>
      )}

      {tab === 'comments' && (
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <CommentsList workOrderId={id} />
        </View>
      )}

      {tab === 'attachments' && (
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <AttachmentsList workOrderId={id} />
        </View>
      )}
    </View>
  );
}