import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, View } from "react-native";

export type BannerItem = {
  id: number | string;
  image_url: string;
};

type Props = {
  data: BannerItem[];
  autoPlay?: boolean;
  interval?: number;
};

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = 190;

export default function BannerCarousel({
  data,
  autoPlay = true,
  interval = 3000,
}: Props) {
  const listRef = useRef<FlatList<BannerItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!autoPlay || data.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % data.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      indexRef.current = next;
      setCurrentIndex(next);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, data.length, interval]);

  return (
    <View>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
        contentContainerStyle={styles.listContent}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
          indexRef.current = index;
          setCurrentIndex(index);
        }}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => (
          <Image source={{ uri: item.image_url }} style={styles.banner} />
        )}
      />

      <View style={styles.dots}>
        {data.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
  },
  banner: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    marginRight: 8,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C9C9C9",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },
});
