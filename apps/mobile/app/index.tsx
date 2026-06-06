import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LoadingState } from '../src/components/states/LoadingState';
import { Screen } from '../src/components/layout/Screen';
import { SplashVideo } from '../src/components/layout/SplashVideo';
import { useAuth } from '../src/lib/auth';
import { getSecureItem, setSecureItem } from '../src/lib/storage';

const splashVideo = require('../assets/splash-video.mp4');
const splashSeenKey = 'intro.splashVideoSeen';

export default function BootstrapRoute() {
  const router = useRouter();
  const { status } = useAuth();
  const [splashState, setSplashState] = useState<'checking' | 'showing' | 'done'>('checking');

  useEffect(() => {
    let mounted = true;

    void getSecureItem(splashSeenKey)
      .then((value) => {
        if (mounted) {
          setSplashState(value === 'true' ? 'done' : 'showing');
        }
      })
      .catch(() => {
        if (mounted) {
          setSplashState('showing');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (splashState !== 'done') return;

    if (status === 'authenticated') {
      router.replace('/(tabs)/home' as never);
    }

    if (status === 'anonymous' || status === 'expired') {
      router.replace('/(auth)/login' as never);
    }
  }, [router, status, splashState]);

  const finishSplash = () => {
    setSplashState('done');
    void setSecureItem(splashSeenKey, 'true');
  };

  if (splashState === 'showing') {
    return <SplashVideo videoSource={splashVideo} onFinish={finishSplash} />;
  }

  return (
    <Screen scroll={false}>
      <LoadingState title="Opening AMG Academy" message="Preparing your app." />
    </Screen>
  );
}
