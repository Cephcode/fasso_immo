import { THEME } from '@/lib/theme';
import { Octicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";
import { useColorScheme } from 'nativewind';


export default function Layout() {
    const { colorScheme } = useColorScheme();
    const colors = colorScheme === 'dark' ? THEME.dark : THEME.light;

  return (

    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: 'white',borderTopColor: colors.background,elevation: 0.5 } }}>
        
    <Tabs.Screen name="(home)/index" 
    options={{title : "Decouvrir",
      tabBarShowLabel: false,
       tabBarIcon: ({ color, focused }) => (
      <Octicons name={focused ? "home-fill" : "home"} size={24} color={ colors.primary} />
          ),
    }}
    
     />

    <Tabs.Screen name="liked" options={{
      tabBarShowLabel: false,
      tabBarIcon: ({ color, focused }) => (
        <Octicons name={focused ? "heart-fill" : "heart"} size={24} color={ colors.primary} />
      ),

    }} />

    <Tabs.Screen name="publish" options={{
      tabBarShowLabel: false,
      tabBarIcon: ({ color, focused }) => (
        <Octicons name={focused ? "feed-plus" : "plus-circle"} size={24} color={ colors.primary} />
      ),

    }} />

    <Tabs.Screen  name="discussions"  options={{ title : "Discussions",
      tabBarShowLabel: false,
      tabBarIcon: ({ color, focused }) => (
        <Octicons name={"comment"} size={24} color={ colors.primary} />
      ),

    }} />

    <Tabs.Screen  name="profile" options={{title : "Profil",tabBarShowLabel: false,
      tabBarIcon: ({ color, focused }) => (
        <Octicons name={focused ? "person-fill" : "person"} size={24} color={ colors.primary} />
      ),

    }} />


    </Tabs>
    
  );
}