'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from 'next/dynamic';
import { fetchWorkflows } from "@/app/API/api";
import Searchbar from "@/app/components/Searchbar/search";
import View from "@/app/components/GridListView/view";
import classes from "@/app/assets/css/pages.module.css";
import { Button, Dropdown, message, Empty } from "antd";
import type { MenuProps } from "antd";
import Image from "next/image";
import wireFrameIcon from "@/app/assets/images/wireframe.svg";
import { BiDotsVerticalRounded } from "react-icons/bi";
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";
import { useEmail } from "@/app/context/emailContext";
import Link from "next/link";
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { getToken } from '@/utils/auth';
import EditableModal from "@/app/modals/edit-modal/edit-modal";
import { editWorkflow } from "@/app/API/api"; // Import the new API function

const Loader = dynamic(() => import('@/app/loading'), { ssr: false });
const DeleteModal = dynamic(() => import('@/app/modals/delete-modal/delete-modal'), { ssr: false });

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
    const token = getToken();

    const handleDeleteWorkflow = async (workflowId: string) => {
        if (!email || !workflowId || !id) return;
        await axios.delete(`${BaseURL}/workflow`, {
            params: {
                userEmail: email,
                workSpace: id,
                workflowName: workflowId,
            },
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    };

    const handleEditWorkflow = async (newName: string) => {
        if (!email || !selectedWorkflow || !id) return;

        try {
            await editWorkflow(email, id, selectedWorkflow.id, newName);
            message.success('Workflow updated successfully.');

            setEditModalVisible(false);
            setEditWorkflowName("");

            const fetchedWorkflows = await fetchWorkflows(email, id, setIsLoading);
            setWorkflows(fetchedWorkflows);

        } catch (error) {
            message.error('Failed to update workflow.');
            console.error('Error:', error);
        }
    };


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

    const menuItems: MenuProps["items"] = [
        {
            label: "Edit Workflow",
            key: "edit",
        },
        {
            label: "Delete Workflow",
            key: "delete",
        }
    ];

    const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    }, []);

    useEffect(() => {
        if (id && email) {
            if (typeof id === "string" && email) {
                setBreadcrumbs([{ href: `/workflows-list`, label: `${id.replace(/-/g, " ")} Workflow Workspace` }]);
                fetchWorkflows(email, id, setIsLoading)
                    .then(fetchedWorkflows => {
                        setWorkflows(fetchedWorkflows);
                    })
                    .catch(error => {
                        message.error(error.message || 'Failed to fetch workflows.');
                    });
            } else {
                console.error("Invalid id type or email is null:", typeof id, email);
                message.error("Invalid id type or email is null.");
            }
        }
    }, [id, email]);

    const filteredWorkflows = workflows.filter(workflow =>
        workflow.name.toLowerCase().includes(searchInput.toLowerCase())
    );

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
                                <div className={`${classes.workspaceName} flex gap-1`}>
                                    <Image src={wireFrameIcon} alt="Workflow Icon" width={32} height={32} />
                                    <p>
                                        <b>{workflow.name}</b>
                                    </p>
                                </div>
                                <div className={`${classes.storage} flex gap-1 alinc`}>
                                    <p className={classes.storageValue}>
                                        {workflow.lastUpdated}
                                    </p>
                                    <div className={classes.dropdownWorkspace}>
                                        <Dropdown
                                            menu={{ items: menuItems, onClick: ({ key }) => handleMenuClick(key, workflow) }}
                                            trigger={["click"]}
                                        >
                                            <Button
                                                className={classes.btnBlank}
                                                data-workflow-id={workflow.id}
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

            {selectedWorkflow && (
                <DeleteModal
                    open={deleteModalVisible}
                    entityName="Workflow"
                    entityId={selectedWorkflow.id}
                    onDelete={handleDeleteWorkflow}
                    onOk={() => {
                        setDeleteModalVisible(false);
                        if (email) {
                            fetchWorkflows(email, id, setIsLoading)
                                .then(fetchedWorkflows => setWorkflows(fetchedWorkflows))
                                .catch(error => message.error(error.message || 'Failed to fetch workflows.'));
                        }
                    }}
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
