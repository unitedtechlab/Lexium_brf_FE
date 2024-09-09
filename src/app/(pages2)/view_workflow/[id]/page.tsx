"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import classes from '@/app/assets/css/workflow.module.css';
import { useNodesState, useEdgesState, ReactFlowProvider } from 'reactflow';
import { fetchWorkspaces, fetchSpecificWorkflow } from '@/app/API/api';
import { useEmail } from '@/app/context/emailContext';
import { message, Spin } from 'antd';

const DragAndDropContainer = dynamic(() => import('./DragAndDropContainer'), { ssr: false });

const Workflow: React.FC = () => {
    const [nodes, setNodes] = useNodesState([]);
    const [edges, setEdges] = useEdgesState([]);
    const { email } = useEmail();
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [workflowName, setWorkflowName] = useState<string | null>(null);
    const [workflowData, setWorkflowData] = useState<any | null>(null);

    useEffect(() => {
        if (email) {
            setIsLoading(true);
            fetchWorkspaces(email, setIsLoading)
                .then((workspaces) => {
                    const filteredWorkspaces = workspaces.filter((workspace) => workspace.cleanDataExist);
                    setWorkspaces(filteredWorkspaces);

                    if (filteredWorkspaces.length > 0) {
                        setWorkspaceId(filteredWorkspaces[0].id);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    message.error('Failed to fetch workspaces.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [email]);

    useEffect(() => {
        if (workspaceId && email) {
            console.log("Fetching available workflows for workspace:", { email, workspaceId });


        }
    }, [workspaceId, email]);

    useEffect(() => {
        if (workspaceId && email && workflowName) {
            console.log("Fetching workflow data for workspace:", { email, workspaceId, workflowName });

            fetchSpecificWorkflow(email, workspaceId, workflowName)
                .then((data) => {
                    setWorkflowData(data);
                    console.log("Fetched Workflow data:", data);
                })
                .catch((error) => {
                    console.error('Error fetching workflow:', error);
                    message.error('Failed to fetch workflow.');
                });
        }
    }, [workspaceId, email, workflowName]);

    return (
        <div className={classes.workflowPage}>
            {isLoading ? (
                <div className={classes.loadingContainer}>
                    <Spin size="large" />
                </div>
            ) : (
                <div className={classes.workflowWrapper}>
                    <div className={classes.reactflowMain} style={{ maxWidth: "100%" }}>
                        <ReactFlowProvider>
                            {workspaceId && workflowData ? (
                                <DragAndDropContainer
                                    nodes={nodes}
                                    setNodes={setNodes}
                                    edges={edges}
                                    setEdges={setEdges}
                                    workflowData={workflowData}
                                    workflowName={workflowName}
                                />
                            ) : (
                                <div>No workspace or workflow selected.</div>
                            )}
                        </ReactFlowProvider>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Workflow;
