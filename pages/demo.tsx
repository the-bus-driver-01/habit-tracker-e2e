import React from 'react';
import Head from 'next/head';
import DayCellDemo from '@/components/DayCellDemo';

const Demo: React.FC = () => {
  return (
    <>
      <Head>
        <title>Habit Tracker - DayCell Demo</title>
        <meta name="description" content="Comprehensive demo of DayCell component with all states" />
      </Head>

      <DayCellDemo />
    </>
  );
};

export default Demo;