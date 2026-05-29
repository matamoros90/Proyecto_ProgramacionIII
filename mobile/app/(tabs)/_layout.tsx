import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"   options={{ title: 'Inicio' }} />
      <Tabs.Screen name="builder" options={{ href: null }} />
      <Tabs.Screen name="quotes"  options={{ title: 'Cotizaciones' }} />
      <Tabs.Screen name="orders"  options={{ title: 'Mis Órdenes' }} />
      <Tabs.Screen name="aprende" options={{ title: 'Aprende' }} />
      <Tabs.Screen name="learn"   options={{ title: 'Cesta' }} />
    </Tabs>
  );
}
