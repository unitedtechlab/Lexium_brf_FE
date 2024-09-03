"use client";

import { Layout } from 'antd';
import React, { useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import HeaderMain from "../Header/header";
import classes from './customlayout.module.css';
import { BiCode, BiCollapseHorizontal } from "react-icons/bi";
import dynamic from 'next/dynamic';

const { Header, Content } = Layout;
const Sidebar = dynamic(() => import('@/app/components/Sidebar/sidebar'), { ssr: false });

type LayoutProps = {
    children: ReactNode;
};

export default function CustomLayout({ children }: LayoutProps) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = useCallback(() => {
        setCollapsed(prev => !prev);
    }, []);

    const ToggleButton = useMemo(() => {
        const Icon = collapsed ? BiCollapseHorizontal : BiCode;
        return <Icon className="trigger" onClick={toggleSidebar} />;
    }, [collapsed, toggleSidebar]);

    const MemoizedHeaderMain = useMemo(() => <HeaderMain />, []);

    return (
        <Layout className={classes.layout}>
            <Sidebar collapsed={collapsed} onCollapse={toggleSidebar} />
            <Layout className={classes.siteLayout}>
                <Header className={classes.header}>
                    <div className={`${classes.hemBurger} flex`}>
                        {ToggleButton}
                    </div>
                    {MemoizedHeaderMain}
                </Header>
                <Content className={classes.bodylayout}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
