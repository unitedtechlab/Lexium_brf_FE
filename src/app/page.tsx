import React from 'react';
import { Button } from 'antd';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const HomePage: React.FC = () => {
    redirect('/dashboard');
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <Link href="/dashboard">
                <Button type="primary">Go to Dashboard</Button>
            </Link>
        </div>
    );
};

export default HomePage;
