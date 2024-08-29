"use client";

import React, { useState, useEffect } from 'react';
import { Button, message, Empty, Dropdown } from 'antd';
import Link from 'next/link';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEmail } from '@/app/context/emailContext';
import classes from '@/app/assets/css/pages.module.css';
import folder from '../../assets/images/database.svg';
import { fetchWorkspaces } from '@/app/API/api';
import { Workspace } from '@/app/types/interface';

const Searchbar = dynamic(() => import('../../components/Searchbar/search'), { ssr: false });
const View = dynamic(() => import('../../components/GridListView/view'), { ssr: false });
const Loader = dynamic(() => import('@/app/loading'), { ssr: false });
const DeleteWorkspaceModal = dynamic(() => import('./[id]/modals/delete-workspace/delete-workspace'), { ssr: false });

export default function CleanDataStorage() {
    const [searchInput, setSearchInput] = useState('');
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const [hasCleanData, setHasCleanData] = useState(false);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const loadWorkspaces = async () => {
        if (email) {
            setIsLoading(true);
            try {
                const workspacesData = await fetchWorkspaces(email, setIsLoading);
                const cleanDataWorkspaces = workspacesData.filter(workspace => workspace.cleanDataExist);
                setWorkspaces(cleanDataWorkspaces);
                setHasCleanData(cleanDataWorkspaces.length > 0);
            } catch (error) {
                message.error('Failed to fetch workspaces.');
                console.error("Failed to fetch workspaces:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            message.error('Email is required to fetch workspaces.');
        }
    };

    useEffect(() => {
        loadWorkspaces();
    }, [email]);

    const handleDeleteWorkspace = (workspace: Workspace | null) => {
        if (workspace) {
            setSelectedWorkspace(workspace);
            setIsDeleteModalVisible(true);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalVisible(false);
        setSelectedWorkspace(null);
    };

    const onDeleteSuccess = () => {
        message.success('Workspace deleted successfully');
        setIsDeleteModalVisible(false);
        setSelectedWorkspace(null);
        loadWorkspaces();
    };

    const filteredWorkspaces = workspaces.filter(workspace =>
        workspace.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <div className={classes.dashboardWrapper}>
            <div className={classes.heading}>
                <h1>Clean Data Storage</h1>
            </div>

            {hasCleanData && (
                <Link href="/workflow" className={`btn btn-outline ${classes.validateBtn}`}>Move to Workflow & Rules</Link>
            )}

            <div className={`${classes.searchView} flex justify-space-between gap-1`}>
                <Searchbar value={searchInput} onChange={handleSearchInputChange} />
                <div className="flex gap-1">
                    <View />
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : filteredWorkspaces.length === 0 ? (
                <div className={classes.noFoldersMessage}>
                    <Empty description="No Data Storage workspace found." />
                </div>
            ) : (
                <div className={`${classes.workspaceCreate} flex gap-2`}>
                    {filteredWorkspaces.map((workspace) => (
                        <div key={workspace.id} className={`${classes.workspacebox}`}>
                            <div className={`flex gap-1 alinc ${classes.link}`}>
                                <Link href={`/data-storage/${workspace.id}/storage-folder`} passHref>
                                    <div className={`${classes.workspaceName} flex gap-1`}>
                                        <Image src={folder} alt="Folder Icon" width={32} height={32} />
                                        <p>
                                            <b>{workspace.name}</b>
                                        </p>
                                    </div>
                                </Link>
                                <div className={`${classes.storage} flex gap-1 alinc`}>
                                    <p className={classes.storageValue}>
                                        <span>{workspace.cleanFileSize}</span>
                                        <b>{workspace.cleanLastUpdated}</b>
                                    </p>
                                    <div className={classes.dropdownWorkspace}>
                                        <Dropdown
                                            menu={{
                                                items: [
                                                    {
                                                        label: 'Delete Data Storage',
                                                        key: 'delete',
                                                        onClick: () => handleDeleteWorkspace(workspace),
                                                    },
                                                ],
                                            }}
                                            trigger={['click']}
                                        >
                                            <Button
                                                className={classes.btnBlank}
                                            >
                                                <BiDotsVerticalRounded />
                                            </Button>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedWorkspace && (
                <DeleteWorkspaceModal
                    open={isDeleteModalVisible}
                    workspaceName={selectedWorkspace.name}
                    workspaceId={selectedWorkspace.id}
                    onOk={onDeleteSuccess}
                    onCancel={closeDeleteModal}
                />
            )}
        </div>
    );
}
