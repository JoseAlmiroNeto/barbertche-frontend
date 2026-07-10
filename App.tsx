import "react-native-gesture-handler";

import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppContainer } from "./src/app/AppContainer";
import { queryClient } from "./src/query/queryClient";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppContainer />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
