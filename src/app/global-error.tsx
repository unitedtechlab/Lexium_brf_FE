"use client"

import React from 'react';
import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';

const GlobalError: React.FC<{ error: Error }> = ({ error }) => {
  const router = useRouter();

  const handleBackHome = () => {
    router.push('/');
  };

  return (
    <Result
      status="500"
      title="500"
      subTitle="Sorry, something went wrong."
      extra={<Button type="primary" onClick={handleBackHome}>Back Home</Button>}
    />
  );
};

export default GlobalError;
