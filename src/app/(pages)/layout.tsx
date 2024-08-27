"use client"

import CustomLayout from '@/app/components/customLayout/index';
import PrivateRoute from '@/app/components/PrivateRoute/PrivateRoute';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <CustomLayout>
        {children}
      </CustomLayout>
    </PrivateRoute>
  );
}
