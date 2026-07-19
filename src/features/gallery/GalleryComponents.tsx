import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { ViewMoreCard } from "../../components/ViewMoreCard";
import { styles } from "../../theme";
import type { GalleryItem } from "./gallery.types";

export function GalleryGrid({
  items,
  renderAction,
}: {
  items: GalleryItem[];
  renderAction?: (item: GalleryItem) => React.ReactNode;
}) {
  return (
    <View style={styles.galleryGrid}>
      {items.map((item) => (
        <View key={item.id} style={styles.galleryCard}>
          <Image source={{ uri: item.image }} style={styles.galleryImage} />
          <Text style={styles.galleryTitle}>{item.title}</Text>
          {renderAction?.(item)}
        </View>
      ))}
    </View>
  );
}

export function GalleryCarousel({
  items,
  onViewMore,
}: {
  items: GalleryItem[];
  onViewMore: () => void;
}) {
  const visibleItems = items.slice(0, 4);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselRow}
    >
      {visibleItems.map((item) => (
        <View key={item.id} style={[styles.galleryCard, styles.carouselCard]}>
          <Image source={{ uri: item.image }} style={styles.carouselImage} />
          <Text style={styles.galleryTitle}>{item.title}</Text>
        </View>
      ))}
      {items.length > 4 ? (
        <ViewMoreCard label="Ver Mais" onPress={onViewMore} />
      ) : null}
    </ScrollView>
  );
}
