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
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { getToken } from '@/utils/auth';
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";

const Searchbar = dynamic(() => import('../../components/Searchbar/search'), { ssr: false });
const View = dynamic(() => import('../../components/GridListView/view'), { ssr: false });
const Loader = dynamic(() => import('@/app/loading'), { ssr: false });
const DeleteModal = dynamic(() => import('@/app/modals/delete-modal/delete-modal'), { ssr: false });

export default function CleanDataStorage() {
    const [searchInput, setSearchInput] = useState('');
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const [hasCleanData, setHasCleanData] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<{ href: string; label: string }[]>([]);

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
        setBreadcrumbs([
            { href: `/dashboard`, label: `Dashboard` }
        ]);
    }, [email]);

    const handleDeleteWorkspace = (workspace: Workspace | null) => {
        if (workspace) {
            setSelectedWorkspace(workspace);
            setIsDeleteModalVisible(true);
        }
    };

    const deleteWorkspace = async (workspaceId: string) => {
        if (!email) return;
        const token = getToken();
        try {
            await axios.delete(`${BaseURL}/cleaned_workspace`, {
                params: {
                    userEmail: email,
                    workSpace: workspaceId,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            onDeleteSuccess();
        } catch (error) {
            message.error('Failed to delete workspace.');
            console.error("Failed to delete workspace:", error);
        }
    };

    const removeWorkspace = (workspaceId: string) => {
        setWorkspaces(workspaces.filter((workspace) => workspace.id !== workspaceId));
    };

    const closeDeleteModal = () => {
        setIsDeleteModalVisible(false);
        setSelectedWorkspace(null);
    };

    const onDeleteSuccess = () => {
        closeDeleteModal();
        removeWorkspace(selectedWorkspace?.id || '');
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
                <Link href="/workflows-list" className={`btn btn-outline ${classes.validateBtn}`}>Move to Workflow & Rules</Link>
            )}

            <div className={`${classes.searchView} flex justify-space-between gap-1`}>
                <BreadCrumb breadcrumbs={breadcrumbs} />
                <div className={`${classes.searchlist} flex gap-1`}>
                    <Searchbar value={searchInput} onChange={handleSearchInputChange} />
                    <div className="flex gap-1">
                        <View />
                    </div>
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
                                        <Image src={folder} alt="Folder Icon" width={32} height={32} loading="lazy" />
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
                <DeleteModal
                    open={isDeleteModalVisible}
                    entityName="Cleaned Workspace"
                    entityId={selectedWorkspace.id}
                    onDelete={() => deleteWorkspace(selectedWorkspace.id)}
                    onOk={onDeleteSuccess}
                    onCancel={closeDeleteModal}
                />
            )}
        </div>
    );
}
