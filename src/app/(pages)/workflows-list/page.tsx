"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, message, Empty } from 'antd';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEmail } from '@/app/context/emailContext';
import classes from '@/app/assets/css/pages.module.css';
import folder from '../../assets/images/database.svg';
import { fetchWorkspaces } from '@/app/API/api';
import { Workspace } from '@/app/types/interface';
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";

const Searchbar = dynamic(() => import('../../components/Searchbar/search'), { ssr: false, loading: () => <p>Loading Searchbar...</p> });
const View = dynamic(() => import('../../components/GridListView/view'), { ssr: false, loading: () => <p>Loading View...</p> });
const Loader = dynamic(() => import('@/app/loading'), { ssr: false });

export default function WorkflowsWorkspaces() {
    const [searchInput, setSearchInput] = useState('');
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<{ href: string; label: string }[]>([]);

    const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    }, []);

    const loadWorkspaces = useCallback(async () => {
        if (!email) {
            message.error('Email is required to fetch workspaces.');
            return;
        }

        setIsLoading(true);
        try {
            const workspacesData = await fetchWorkspaces(email, setIsLoading);
            const workflowWorkspaces = workspacesData.filter(workspace => workspace.workFlowExist);
            setWorkspaces(workflowWorkspaces);
        } catch (error) {
            message.error('Failed to fetch workspaces.');
            console.error("Failed to fetch workspaces:", error);
        } finally {
            setIsLoading(false); // Set loading to false after fetch completes
        }
    }, [email]);

    useEffect(() => {
        if (email) {
            loadWorkspaces();
        }
        setBreadcrumbs([{ href: `/data-storage`, label: `Data Storage` }]);
    }, [email, loadWorkspaces]);

    const filteredWorkspaces = useMemo(() => {
        return workspaces.filter(workspace =>
            workspace.name.toLowerCase().includes(searchInput.toLowerCase())
        );
    }, [searchInput, workspaces]);

    return (
        <div className={classes.dashboardWrapper}>
            <div className={classes.heading}>
                <h1>Workflow Workspaces</h1>
            </div>

            <div className={`${classes.searchView} flex justify-space-between gap-1`}>
                <BreadCrumb breadcrumbs={breadcrumbs} />
                <div className={`${classes.searchlist} flex gap-1`}>
                    <Searchbar value={searchInput} onChange={handleSearchInputChange} />
                    <div className="flex gap-1">
                        <View />
                        <Link href="/workflow" className="btn">Create WorkFlow</Link>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : filteredWorkspaces.length === 0 ? (
                <div className={classes.noFoldersMessage}>
                    <Empty description="No workflow-enabled workspaces found." />
                </div>
            ) : (
                <div className={`${classes.workspaceCreate} flex gap-2`}>
                    {filteredWorkspaces.map((workspace) => (
                        <div key={workspace.id} className={`${classes.workspacebox}`}>
                            <div className={`flex gap-1 alinc ${classes.link}`}>
                                <Link href={`/workflows-list/${workspace.id}/workflows`} passHref>
                                    <div className={`${classes.workspaceName} flex gap-1`}>
                                        <Image src={folder} alt="Folder Icon" width={32} height={32} />
                                        <p>
                                            <b>{workspace.name}</b>
                                        </p>
                                    </div>
                                </Link>
                                <div className={`${classes.storage} flex gap-1 alinc`}>
                                    <p className={classes.storageValue}>
                                        <b>{workspace.cleanLastUpdated}</b>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
