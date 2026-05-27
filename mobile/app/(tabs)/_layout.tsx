import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

function TabIcon({ name, color, size }: { name: any; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabsLayout() {
  // La protección por rol la maneja _layout.tsx — no duplicar navegación aquí
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: 'Armar PC',
          tabBarIcon: ({ color, size }) => <TabIcon name="construct" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Cotizaciones',
          tabBarIcon: ({ color, size }) => <TabIcon name="document-text" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Mis Órdenes',
          tabBarIcon: ({ color, size }) => <TabIcon name="cube" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Cesta',
          tabBarIcon: ({ color, size }) => <TabIcon name="cart" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
