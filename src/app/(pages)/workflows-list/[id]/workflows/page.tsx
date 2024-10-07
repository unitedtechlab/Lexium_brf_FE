"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, message, Empty, Dropdown } from 'antd';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEmail } from '@/app/context/emailContext';
import classes from '@/app/assets/css/pages.module.css';
import wireFrameIcon from "@/app/assets/images/wireframe.png";
import { BiDotsVerticalRounded } from 'react-icons/bi';
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";
import { useParams } from "next/navigation";
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { getToken } from '@/utils/auth';
import { fetchWorkflows, editWorkflow } from "@/app/API/api";
import type { MenuProps } from 'antd'; // Import MenuProps type from antd

const Searchbar = dynamic(() => import('@/app/components/Searchbar/search'), { ssr: false });
const View = dynamic(() => import('@/app/components/GridListView/view'), { ssr: false });
const Loader = dynamic(() => import('@/app/loading'), { ssr: false });
const DeleteModal = dynamic(() => import('@/app/modals/delete-modal/delete-modal'), { ssr: false });
const EditableModal = dynamic(() => import('@/app/modals/edit-modal/edit-modal'), { ssr: false });

interface Workflow {
    id: string;
    name: string;
    size: string;
    lastUpdated: string;
}

const WorkflowsList = () => {
    const { id } = useParams<{ id: string }>();
    const [searchInput, setSearchInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<{ href: string; label: string }[]>([]);
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [editWorkflowName, setEditWorkflowName] = useState("");
    const { email } = useEmail();
    const token = useMemo(() => getToken(), []);

    const fetchWorkflowsData = useCallback(async () => {
        if (!id || !email) return;

        setIsLoading(true);
        try {
            const fetchedWorkflows = await fetchWorkflows(email, id, setIsLoading);
            setWorkflows(fetchedWorkflows);
        } catch (error) {
            message.error('Failed to fetch workflows.');
            console.error("Unexpected error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [id, email]);

    useEffect(() => {
        setBreadcrumbs([{ href: `/workflows-list`, label: `${id?.replace(/-/g, " ")} Workflow` }]);
        fetchWorkflowsData();
    }, [fetchWorkflowsData, id]);

    const handleDeleteWorkflow = useCallback(async () => {
        if (!email || !selectedWorkflow || !id) return;
        setIsLoading(true);
        try {
            await axios.delete(`${BaseURL}/workflow`, {
                params: {
                    userEmail: email,
                    workSpace: id,
                    workflowName: selectedWorkflow.id,
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            message.success('Workflow deleted successfully.');
            fetchWorkflowsData();
        } catch (error) {
            if (error instanceof Error) {
                message.error(error.message || 'Failed to delete workflow.');
                console.error("Error deleting workflow:", error);
            } else {
                message.error('Failed to delete workflow.');
                console.error("Unexpected error:", error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [email, id, selectedWorkflow, fetchWorkflowsData, token]);

    const handleEditWorkflow = useCallback(async (newName: string) => {
        if (!email || !selectedWorkflow || !id) return;
        setIsLoading(true);
        try {
            await editWorkflow(email, id, selectedWorkflow.id, newName);
            message.success('Workflow updated successfully.');
            fetchWorkflowsData();
        } catch (error) {
            if (error instanceof Error) {
                message.error(error.message || 'Failed to update workflow.');
                console.error('Error:', error);
            } else {
                message.error('Failed to update workflow.');
                console.error("Unexpected error:", error);
            }
        } finally {
            setIsLoading(false);
        }
    }, [email, id, selectedWorkflow, fetchWorkflowsData]);

    const handleMenuClick = useCallback((key: string, workflow: Workflow) => {
        if (key === 'delete') {
            setSelectedWorkflow(workflow);
            setDeleteModalVisible(true);
        } else if (key === 'edit') {
            setSelectedWorkflow(workflow);
            setEditWorkflowName(workflow.name);
            setEditModalVisible(true);
        }
    }, []);

    const menuItems: MenuProps["items"] = useMemo(() => [
        {
            label: "Edit Workflow",
            key: "edit",
        },
        {
            label: "Delete Workflow",
            key: "delete",
        }
    ], []);

    const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    }, []);

    const filteredWorkflows = useMemo(() => {
        return workflows.filter(workflow =>
            workflow.name.toLowerCase().includes(searchInput.toLowerCase())
        );
    }, [searchInput, workflows]);

    return (
        <div className={`${classes.dashboardWrapper} ${classes.prevalidatebtn}`}>
            <div className={classes.heading}>
                <h1>Workflow Management</h1>
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
            ) : filteredWorkflows.length === 0 ? (
                <div className={classes.noFoldersMessage}>
                    <Empty description="No workflows found." />
                </div>
            ) : (
                <div className={`${classes.workspaceCreate} flex gap-2`}>
                    {filteredWorkflows.map((workflow) => (
                        <div key={workflow.id} className={`${classes.workspacebox}`}>
                            <div className={`flex gap-1 alinc ${classes.link}`}>
                                <Link href={`/view_workflow/${workflow.id}?workspaceId=${id}`}>
                                    <div className={`${classes.workspaceName} flex gap-1`}>
                                        <Image src={wireFrameIcon} alt="Workflow Icon" width={32} height={32} />
                                        <p>
                                            <b>{workflow.name}</b>
                                        </p>
                                    </div>
                                </Link>
                                <div className={`${classes.storage} flex gap-1 alinc`}>
                                    <p className={classes.storageValue}>
                                        {workflow.lastUpdated}
                                    </p>
                                    <div className={classes.dropdownWorkspace}>
                                        <Dropdown
                                            menu={{ items: menuItems, onClick: ({ key }) => handleMenuClick(key, workflow) }}
                                            trigger={["click"]}
                                        >
                                            <Button className={classes.btnBlank}>
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

            {selectedWorkflow && (
                <DeleteModal
                    open={deleteModalVisible}
                    entityName="Workflow"
                    entityId={selectedWorkflow.id}
                    onDelete={handleDeleteWorkflow}
                    onOk={() => setDeleteModalVisible(false)}
                    onCancel={() => setDeleteModalVisible(false)}
                />
            )}

            {selectedWorkflow && (
                <EditableModal
                    open={editModalVisible}
                    title="Edit Workflow"
                    initialValue={editWorkflowName}
                    fieldLabel="Workflow Name"
                    onSubmit={handleEditWorkflow}
                    onCancel={() => setEditModalVisible(false)}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default WorkflowsList;
