import React from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Button, Text } from 'react-native';
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { listWorkOrdersPage, type WorkOrder, type Page } from '../api/workorders';
import WorkOrderItem from '../components/WorkOrderItem';
import { useNavigation } from '@react-navigation/native';

type Cursor = string | undefined;
type WOPage = Page<WorkOrder>;

export default function WorkOrderListScreen() {
  const nav = useNavigation<any>();

  const q = useInfiniteQuery({
    queryKey: ['wo', { per: 20 }] as const,
    initialPageParam: undefined as Cursor,
    queryFn: ({ pageParam }) => listWorkOrdersPage({ per_page: 20, cursor: pageParam }),
    getNextPageParam: (last) => last.nextCursor,
    staleTime: 30_000,
  });


  const inf = q.data as InfiniteData<WOPage, Cursor> | undefined;
  const data: WorkOrder[] = inf?.pages.flatMap((p: WOPage) => p.data) ?? [];

  if (q.isError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text>Liste yüklenemedi.</Text>
        <Button title="Tekrar dene" onPress={() => q.refetch()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <WorkOrderItem item={item} onPress={() => nav.navigate('WorkOrderDetail', { id: item.id })} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={q.isFetching && !q.isFetchingNextPage}
            onRefresh={() => q.refetch()}
          />
        }
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
        }}
        ListFooterComponent={
          q.isFetchingNextPage ? (
            <View style={{ padding: 12 }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !q.isLoading ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text>Kayıt yok.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}