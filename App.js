import { StatusBar } from 'expo-status-bar';
// import { StyleSheet,View } from 'react-native';
import { SafeAreaView } from 'react-native';
import Navigator from './component/Navigator';

export default function App() {
  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
      <Navigator />
      <StatusBar style="auto" />
    </SafeAreaView>

    </>
  );
}




