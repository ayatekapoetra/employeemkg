import React, { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { AppScreen, LoadingHauler } from '../../src/components/common';

export default function AttendanceHistoryRoute() {
  const [ScreenComponent, setScreenComponent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const task = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        if (!isMounted) return;
        const module = require('../../src/features/attendance/screens/AttendanceHistoryMonthlyScreen');
        setScreenComponent(() => module.default);
      });
    });

    return () => {
      isMounted = false;
      task.cancel?.();
    };
  }, []);

  if (!ScreenComponent) {
    return (
      <AppScreen>
        <LoadingHauler message="Membuka Absensi Bulanan..." type="default" />
      </AppScreen>
    );
  }

  return <ScreenComponent />;
}
