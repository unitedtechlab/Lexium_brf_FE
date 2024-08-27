import React from 'react';
import { Button } from 'antd';
import Link from 'next/link';

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <Link href="/about">
                <Button type="primary">Go to About Page</Button>
            </Link>
        </div>
    );
};

export default HomePage;
