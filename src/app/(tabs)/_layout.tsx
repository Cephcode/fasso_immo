import { Tabs } from "expo-router";
export default function Layout() {
  return (

    <Tabs screenOptions={{ headerShown: false }}>
        
    <Tabs.Screen name="(home)/index" options={{title : "Découvrir"}} />

    <Tabs.Screen name="liked" options={{title : "likes"}} />

    <Tabs.Screen name="publish" options={{title : "Publier"}}  />

    <Tabs.Screen  name="discussions" options={{title : "Discussions"}} />

    <Tabs.Screen  name="profile" options={{title : "Profil"}} />


    </Tabs>
    
  );
}