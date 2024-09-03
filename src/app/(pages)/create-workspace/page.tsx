'use client';

import React, { useState, useEffect } from 'react';
import { Button, message, Empty, Dropdown } from 'antd';
import Link from 'next/link';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useEmail } from '@/app/context/emailContext';
import classes from '@/app/assets/css/pages.module.css';
import folder from '../../assets/images/database.svg';
import Loader from '@/app/loading';
import { fetchWorkspaces } from '@/app/API/api';
import { Workspace } from '@/app/types/interface';
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { getToken } from '@/utils/auth';
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";

const Searchbar = dynamic(() => import('../../components/Searchbar/search'), { ssr: false });
const View = dynamic(() => import('../../components/GridListView/view'), { ssr: false });
const DeleteModal = dynamic(() => import('@/app/modals/delete-modal/delete-modal'), { ssr: false });
const EditableModal = dynamic(() => import('@/app/modals/edit-modal/edit-modal'), { ssr: false });
const CreateWorkspaceModal = dynamic(() => import('@/app/modals/create-modal/create-modal'), { ssr: false });

export default function CreateWorkSpace() {
    const [searchInput, setSearchInput] = useState('');
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<{ href: string; label: string }[]>([]);

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

    const handleCreateModalOk = async (workspaceName: string) => {
        if (!email) return;
        const token = getToken();
        try {
            const response = await axios.post(`${BaseURL}/workspace`, {
                UserEmail: email,
                WorkSpace: workspaceName,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                message.success('Workspace created successfully!');
                setIsCreateModalVisible(false);
                loadWorkspaces();
            } else {
                message.error(response.data.message || 'Failed to create workspace.');
            }
        } catch (error) {
            message.error('Failed to create workspace.');
            console.error('Error creating workspace:', error);
        }
    };

    const updateWorkspaceName = (workspaceId: string, newName: string) => {
        const updatedWorkspaces = workspaces.map((workspace) =>
            workspace.id === workspaceId ? { ...workspace, name: newName } : workspace
        );
        setWorkspaces(updatedWorkspaces);

        if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
            setSelectedWorkspace({ ...selectedWorkspace, name: newName });
        }
    };

    const removeWorkspace = (workspaceId: string) => {
        setWorkspaces(workspaces.filter((workspace) => workspace.id !== workspaceId));
    };

    const deleteWorkspace = async (workspaceId: string) => {
        if (!email) return;
        const token = getToken();
        try {
            await axios.delete(`${BaseURL}/workspace`, {
                params: {
                    userEmail: email,
                    workSpace: workspaceId,
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            message.success('Workspace deleted successfully!');
            removeWorkspace(workspaceId);
        } catch (error) {
            message.error('Failed to delete workspace.');
            console.error("Failed to delete workspace:", error);
        }
    };

    const editWorkspaceName = async (newName: string) => {
        if (!email || !selectedWorkspace) return;
        const token = getToken();

        try {
            const response = await axios.put(`${BaseURL}/workspace`, {
                UserEmail: email,
                workSpace: selectedWorkspace.name,
                Data: newName,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                updateWorkspaceName(selectedWorkspace.id, newName);
                message.success('Workspace name updated successfully!');
                setIsEditModalVisible(false);
            } else {
                throw new Error('API response not OK');
            }
        } catch (error) {
            message.error('Failed to update workspace name.');
            console.error("Failed to update workspace:", error);
        }
    };

    const loadWorkspaces = async () => {
        if (email) {
            setIsLoading(true);
            try {
                const workspacesData = await fetchWorkspaces(email, setIsLoading);
                setWorkspaces(workspacesData);
            } catch (error) {
                message.error('Failed to fetch workspaces.');
                console.error("Failed to fetch workspaces.");
            } finally {
                setIsLoading(false);
            }
        } else {
            message.error('Email is required to fetch workspaces.');
        }
    };

    useEffect(() => {
        loadWorkspaces();
        setBreadcrumbs([
            { href: `/dashboard`, label: `Dashboard` }
        ]);
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
                <BreadCrumb breadcrumbs={breadcrumbs} />
                <div className={`${classes.searchlist} flex gap-1`}>
                    <Searchbar value={searchInput} onChange={handleSearchInputChange} />
                    <div className="flex gap-1">
                        <View />
                        <Button className="btn" onClick={openCreateWorkspaceModal}>
                            Create Workspace
                        </Button>
                    </div>
                </div>
            </div>

            <CreateWorkspaceModal
                open={isCreateModalVisible}
                title="Create Workspace"
                fieldLabel="Workspace Name"
                onSubmit={handleCreateModalOk}
                onCancel={handleCreateModalCancel}
                isLoading={isLoading}
            />
            <EditableModal
                open={isEditModalVisible}
                title="Edit Workspace"
                initialValue={selectedWorkspace?.name || ''}
                fieldLabel="New Workspace Name"
                onSubmit={editWorkspaceName}
                onCancel={() => setIsEditModalVisible(false)}
            />
            {selectedWorkspace && (
                <DeleteModal
                    open={isDeleteModalVisible}
                    entityName="Workspace"
                    entityId={selectedWorkspace.id}
                    onDelete={() => deleteWorkspace(selectedWorkspace.id)}
                    onOk={() => {
                        setIsDeleteModalVisible(false);
                        setSelectedWorkspace(null);
                    }}
                    onCancel={() => setIsDeleteModalVisible(false)}
                />
            )}

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
                                <Link href={`/create-folder/${encodeURIComponent(workspace.name)}`}>
                                    <div className={`${classes.workspaceName} flex gap-1`}>
                                        <Image src={folder} alt="Folder Icon" width={32} height={32} loading="lazy" />
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
