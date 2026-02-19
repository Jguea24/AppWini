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
  fullWidth?: boolean;
  horizontalPadding?: number;
};

const { width } = Dimensions.get("window");

export default function BannerCarousel({
  data,
  autoPlay = true,
  interval = 3000,
  fullWidth = false,
  horizontalPadding = 12,
}: Props) {
  const listRef = useRef<FlatList<BannerItem>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const indexRef = useRef(0);
  const sidePadding = fullWidth ? 0 : horizontalPadding;
  const cardWidth = width - sidePadding * 2;
  const cardHeight = Math.round(cardWidth * 0.54);

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
    <View style={styles.carouselContainer}>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardWidth}
        snapToAlignment="start"
        contentContainerStyle={[styles.listContent, { paddingHorizontal: sidePadding }]}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
          indexRef.current = index;
          setCurrentIndex(index);
        }}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item }) => (
          <View style={[styles.bannerCard, { width: cardWidth, height: cardHeight }]}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.banner}
              resizeMode="cover"
            />
          </View>
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
  carouselContainer: {
    backgroundColor: "#e8e9eb",
    paddingVertical: 10,
    borderRadius: 14,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  bannerCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0F1118",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    width: 22,
    height: 8,
    backgroundColor: "#FFFFFF",
  },
});
