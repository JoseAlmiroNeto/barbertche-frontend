import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { ViewMoreCard } from "../../components/ViewMoreCard";
import { styles } from "../../theme";
import { money } from "../../utils/time";
import type { Product } from "./products.types";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <View style={styles.productGrid}>
      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <ProductBody product={product} />
        </View>
      ))}
    </View>
  );
}

export function ProductCarousel({
  products,
  onViewMore,
}: {
  products: Product[];
  onViewMore: () => void;
}) {
  const visibleProducts = products.slice(0, 4);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselRow}
    >
      {visibleProducts.map((product) => (
        <View key={product.id} style={[styles.productCard, styles.carouselCard]}>
          <Image source={{ uri: product.image }} style={styles.carouselImage} />
          <ProductBody product={product} />
        </View>
      ))}
      {products.length > 4 ? (
        <ViewMoreCard label="Ver Mais" onPress={onViewMore} />
      ) : null}
    </ScrollView>
  );
}

function ProductBody({ product }: { product: Product }) {
  return (
    <View style={styles.productBody}>
      <Text style={styles.cardTitle}>{product.name}</Text>
      <Text style={styles.cardText}>{product.description}</Text>
      <View style={styles.cardTop}>
        <Text style={styles.price}>{money(product.price)}</Text>
        <Text style={[styles.stock, !product.available && styles.stockOff]}>
          {product.available ? "Disponível" : "Indisp."}
        </Text>
      </View>
    </View>
  );
}
