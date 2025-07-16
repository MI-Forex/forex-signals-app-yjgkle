import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
import { router } from 'expo-router';

export default function TestScreen() {
  console.log('TestScreen rendered');

  return (
    <View style={commonStyles.centerContent}>
      <Text style={commonStyles.title}>Test Screen</Text>
      <Text style={commonStyles.text}>
        If you can see this screen, the app is working correctly!
      </Text>
      <View style={{ marginTop: 20 }}>
        <Button
          text="Go to Login"
          onPress={() => router.push('/auth/login')}
        />
      </View>
    </View>
  );
}