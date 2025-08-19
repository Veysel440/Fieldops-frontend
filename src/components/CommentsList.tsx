import React from 'react';
import { View, Text, FlatList, Button, ActivityIndicator } from 'react-native';
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { listCommentsPage, type Comment, type Paged } from '../api/workorders';

type Props = { workOrderId: number };

export default function CommentsList({ workOrderId }: Props) {
  type CommentsPage = Paged<Comment>;

  const q = useInfiniteQuery({
    queryKey: ['wo', workOrderId, 'comments'] as const,
    initialPageParam: 1 as number,
    queryFn: ({ pageParam }) => listCommentsPage(workOrderId, pageParam as number),
    getNextPageParam: (last) => last.nextPage,
    staleTime: 15_000,
  });

  const inf = q.data as InfiniteData<CommentsPage, number> | undefined;
  const items: Comment[] = inf?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View style={{ gap: 8 }}>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: '600' }}>{item.user?.name ?? 'User'}</Text>
            <Text>{item.body}</Text>
            {!!item.created_at && <Text style={{ color: '#666', fontSize: 12 }}>{item.created_at}</Text>}
          </View>
        )}
        ListFooterComponent={
          q.isFetchingNextPage ? (
            <View style={{ padding: 12 }}><ActivityIndicator/></View>
          ) : q.hasNextPage ? (
            <View style={{ padding: 8 }}>
              <Button title="Daha fazla yükle" onPress={() => q.fetchNextPage()} />
            </View>
          ) : null
        }
      />
    </View>
  );
}