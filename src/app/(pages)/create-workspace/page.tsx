"use client";

import React, { useState, useEffect } from 'react';
import { Button, message, Empty, Dropdown } from 'antd';
import Link from 'next/link';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Searchbar from '../../components/Searchbar/search';
import View from '../../components/GridListView/view';
import { useEmail } from '@/app/context/emailContext';
import classes from '@/app/assets/css/pages.module.css';
import folder from '../../assets/images/database.svg';
import Loader from '@/app/loading';
import { fetchWorkspaces } from '@/app/API/api';
import { Workspace } from '@/app/types/interface';

const CreateWorkspaceModal = dynamic(() => import('./modals/create-workspace/workspace'));
const EditWorkspaceModal = dynamic(() => import('./modals/edit-modal/editmodal'));
const DeleteWorkspaceModal = dynamic(() => import('./modals/delete-modal/deletemodal'));

export default function CreateWorkSpace() {
    const [searchInput, setSearchInput] = useState('');
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);

    const items = [
        {
            label: 'Edit',
            key: 'edit',
            onClick: () => handleEditWorkspace(selectedWorkspace),
        },
        {
            label: 'Delete',
            key: 'delete',
            onClick: () => handleDeleteWorkspace(selectedWorkspace),
        },
    ];

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const openCreateWorkspaceModal = () => {
        setIsCreateModalVisible(true);
    };

    const handleCreateModalOk = () => {
        setIsCreateModalVisible(false);
        loadWorkspaces();
    };

    const handleCreateModalCancel = () => {
        setIsCreateModalVisible(false);
    };

    const handleEditWorkspace = (workspace: Workspace | null) => {
        if (workspace) {
            setSelectedWorkspace(workspace);
            setIsEditModalVisible(true);
        }
    };

    const handleDeleteWorkspace = (workspace: Workspace | null) => {
        if (workspace) {
            setSelectedWorkspace(workspace);
            setIsDeleteModalVisible(true);
        }
    };

    const updateWorkspaceName = (workspaceId: string, newName: string) => {
        const updatedWorkspaces = workspaces.map((workspace) =>
            workspace.id === workspaceId ? { ...workspace, name: newName } : workspace
        );
        setWorkspaces(updatedWorkspaces);
    };

    const removeWorkspace = (workspaceId: string) => {
        setWorkspaces(workspaces.filter((workspace) => workspace.id !== workspaceId));
    };

    const loadWorkspaces = async () => {
        if (email) {
            setIsLoading(true);
            try {
                const workspacesData = await fetchWorkspaces(email, setIsLoading);
                setWorkspaces(workspacesData);
            } catch (error) {
                message.error('Failed to fetch workspaces.');
                console.error("Failed to fetch workspaces.")
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

    const filteredWorkspaces = workspaces.filter(workspace =>
        workspace.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <div className={classes.dashboardWrapper}>
            <div className={classes.heading}>
                <h1>Workspace Management</h1>
            </div>
            <div className={`${classes.searchView} flex justify-space-between gap-1`}>
                <Searchbar value={searchInput} onChange={handleSearchInputChange} />
                <div className="flex gap-1">
                    <View />
                    <Button className="btn" onClick={openCreateWorkspaceModal}>
                        Create Workspace
                    </Button>
                </div>
            </div>
            <CreateWorkspaceModal
                open={isCreateModalVisible}
                onOk={handleCreateModalOk}
                onCancel={handleCreateModalCancel}
            />
            <EditWorkspaceModal
                open={isEditModalVisible}
                workspaceId={selectedWorkspace?.id || ''}
                initialWorkspaceName={selectedWorkspace?.name || ''}
                onOk={(newName: string) => {
                    setIsEditModalVisible(false);
                    updateWorkspaceName(selectedWorkspace?.id || '', newName);
                    setSelectedWorkspace(null);
                    loadWorkspaces();
                }}
                onCancel={() => setIsEditModalVisible(false)}
            />
            <DeleteWorkspaceModal
                open={isDeleteModalVisible}
                workspaceName={selectedWorkspace?.name || ''}
                workspaceId={selectedWorkspace?.id || ''}
                onOk={() => {
                    setIsDeleteModalVisible(false);
                    removeWorkspace(selectedWorkspace?.id || '');
                    setSelectedWorkspace(null);
                }}
                onCancel={() => setIsDeleteModalVisible(false)}
            />

            {isLoading ? (
                <Loader />
            ) : filteredWorkspaces.length === 0 ? (
                <div className={classes.noFoldersMessage}>
                    <Empty description="No Workspaces found." />
                </div>
            ) : (
                <div className={`${classes.workspaceCreate} flex gap-2`}>
                    {filteredWorkspaces.map((workspace) => (
                        <div key={workspace.id} className={`${classes.workspacebox}`}>
                            <div className={`flex gap-1 alinc ${classes.link}`}>
                                <Link href={`/create-folder/${workspace.id}`}>
                                    <div className={`${classes.workspaceName} flex gap-1`}>
                                        <Image src={folder} alt="Folder Icon" width={32} height={32} />
                                        <p>
                                            <b>{workspace.name.toUpperCase()}</b>
                                        </p>
                                    </div>
                                </Link>
                                <div className={`${classes.storage} flex gap-1 alinc`}>
                                    <p className={classes.storageValue}>
                                        <span>{workspace.fileSize}</span>
                                        <b>{workspace.lastUpdated}</b>
                                    </p>
                                    <div className={classes.dropdownWorkspace}>
                                        <Dropdown menu={{ items }} trigger={['click']}>
                                            <Button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedWorkspace(workspace);
                                                }}
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
        </div>
    );
}
