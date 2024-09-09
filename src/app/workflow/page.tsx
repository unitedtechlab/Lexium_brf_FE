"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import classes from '@/app/assets/css/workflow.module.css';
import { useNodesState, useEdgesState, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchWorkspaces, fetchFolders, runWorkflow } from '@/app/API/api';
import { useEmail } from '@/app/context/emailContext';
import { message } from 'antd';
import { CustomNode } from '../types/workflowTypes';
import Sidebar from '@/app/components/workflow/sidebar';
import Topbar from '@/app/components/workflow/topbar';
import { Node, Edge } from 'reactflow';
import axios from 'axios';
import { BaseURL } from "@/app/constants/index";
import { getToken } from '@/utils/auth';

const initialSidebarItems = [
    { id: 'startingnode', icon: 'MdOutlineJoinInner' as const, title: 'Starting Node', description: 'Starting Node', enabled: true },
    { id: 'filter', icon: 'MdOutlineFilterAlt' as const, title: 'Filter', description: 'Filter', enabled: false },
    { id: 'sort', icon: 'FaSortAlphaDown' as const, title: 'Sort', description: 'Sort', enabled: false },
    { id: 'conditional', icon: 'FaProjectDiagram' as const, title: 'Conditional', description: 'Conditional', enabled: false },
    { id: 'groupby', icon: 'VscGroupByRefType' as const, title: 'Group By', description: 'Group By', enabled: false },
    { id: 'pivottable', icon: 'MdOutlinePivotTableChart' as const, title: 'Pivot Table', description: 'Pivot Table', enabled: false },
    { id: 'arithmetic', icon: 'TbMathSymbols' as const, title: 'Arithmetic', description: 'Arithmetic', enabled: false },
    { id: 'statistical', icon: 'PiChartLineUp' as const, title: 'Statistical', description: 'Statistical', enabled: false },
    { id: 'scaling', icon: 'SiTimescale' as const, title: 'Scaling', description: 'Scaling', enabled: false },
    { id: 'output', icon: 'AiOutlineTable' as const, title: 'Output', description: 'Output', enabled: false },
];

const Preloader = dynamic(() => import('../loading'));
const DragAndDropContainer = dynamic(() => import('./components/DragAndDropContainer'), { ssr: false });

const WorkFlow: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode[]>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);
    const { email } = useEmail();
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<string | null>(null);
    const [sidebarItems, setSidebarItems] = useState(initialSidebarItems);
    const [workflowName, setWorkflowName] = useState<string>('Workflow Name');
    const [outputNodeIds, setOutputNodeIds] = useState<string[]>([]);
    const [workflowOutput, setWorkflowOutput] = useState<any>(null);
    const [isRunClicked, setIsRunClicked] = useState<boolean>(false);
    const [isRunLoading, setIsRunLoading] = useState<boolean>(false);

    useEffect(() => {
        const handleLoad = () => setLoading(false);

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, []);

    const traverseNodes = (startNode: Node, nodes: Node[], edges: Edge[], visitedNodes = new Set<string>()) => {
        const rule = [];
        const stack = [startNode];

        while (stack.length > 0) {
            const currentNode = stack.pop();

            if (!currentNode || visitedNodes.has(currentNode.id)) {
                continue;
            }

            visitedNodes.add(currentNode.id);
            const incomingEdge = edges.find(edge => edge.target === currentNode.id);
            const sourceId = incomingEdge ? incomingEdge.source : currentNode.id;

            const outgoingEdges = edges.filter(edge => edge.source === currentNode.id);
            const targetEdgeIds = outgoingEdges.map(edge => edge.target);

            const { label, pivotTable, ...nodeDataWithoutLabel } = currentNode.data as any;

            let nodeData = nodeDataWithoutLabel;
            if (currentNode.data.type === 'if' || currentNode.data.type === 'else if' || currentNode.data.type === 'else') {
                nodeData = {
                    ...nodeDataWithoutLabel,
                    conditional: undefined
                };
            } else if (pivotTable) {
                nodeData = {
                    ...nodeDataWithoutLabel,
                    pivotTable: {
                        index: pivotTable.pivotColumns.index,
                        column: pivotTable.pivotColumns.column,
                        value: pivotTable.pivotColumns.value,
                        functionCheckboxes: pivotTable.functionCheckboxes,
                    },
                };
            }

            rule.push({
                id: currentNode.id,
                source: sourceId,
                target: targetEdgeIds,
                nodeData,
            });
            if (currentNode.data.type === 'output') {
                continue;
            }
            outgoingEdges.forEach(edge => {
                const targetNode = nodes.find(node => node.id === edge.target);
                if (targetNode) {
                    stack.push(targetNode);
                }
            });
        }

        return rule;
    };

    const handleSaveClick = async (): Promise<boolean> => {
        const rules: { [key: string]: any[] } = {};
        let ruleCounter = 1;

        const visitedNodes = new Set<string>();

        nodes.forEach(node => {
            if ('type' in node.data && (node.data.type === 'table' || node.data.type === 'mergeTable') && !visitedNodes.has(node.id)) {
                const rule = traverseNodes(node, nodes, edges, visitedNodes);

                if (rule.length > 0) {
                    if (!Object.values(rules).some(existingRule =>
                        (existingRule as any[]).every(r => rule.some(n => n.id === r.id))
                    )) {
                        rules[`rule${ruleCounter}`] = rule;
                        ruleCounter++;
                    }
                } else {
                    console.log(`No rule found for node: ${node.id}`);
                }
            }
        });

        const exportedData = {
            workSpace: currentWorkspace,
            userEmail: email,
            workflowName: workflowName,
            data: rules,
        };

        const jsonExport = JSON.stringify(exportedData, null, 2);
        console.log('Exported Data:', jsonExport);

        try {
            const token = getToken();
            const response = await axios.post(`${BaseURL}/workflow`, exportedData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                const outputIds = response.data.data || [];
                setOutputNodeIds(outputIds);
                setWorkflowOutput(response.data.data);
                setIsRunClicked(true);

                message.success(response.data.message || 'Workflow saved successfully');
                return true;
            } else {
                message.error('Failed to save workflow');
                return false;
            }
        } catch (error) {
            console.error('Error saving workflow:', error);
            message.error('An error occurred while saving the workflow');
            return false;
        }
    };

    const handleRunClick = async () => {
        if (!email) {
            message.error('User email is missing.');
            return;
        }
        if (!currentWorkspace) {
            message.error('Workspace ID is missing.');
            return;
        }
        if (!workflowName.trim()) {
            message.error('Workflow name is missing.');
            return;
        }

        setIsRunLoading(true);
        try {
            const workflowData = await runWorkflow(email, currentWorkspace, workflowName);

            if (workflowData) {
                const outputNodeIds = Object.keys(workflowData)
                    .map(ruleKey => Object.keys(workflowData[ruleKey]))
                    .flat();

                setWorkflowOutput(workflowData);
                setOutputNodeIds(outputNodeIds);
                setIsRunClicked(true);

                console.log("output nodes id", outputNodeIds)

                message.success('Workflow run successfully!');
            } else {
                message.error('No output nodes found in the workflow.');
            }
        } catch (error: any) {
            message.error(error?.response?.data?.message || error.message || 'Failed to run workflow.');
            console.error('Error running workflow:', error);
        } finally {
            setIsRunLoading(false);
        }
    };

    useEffect(() => {
        if (email) {
            fetchWorkspaces(email, setLoading)
                .then((workspaces) => {
                    const filteredWorkspaces = workspaces.filter((workspace) => workspace.cleanDataExist);
                    setWorkspaces(filteredWorkspaces);
                })
                .catch((error) => {
                    console.error(error);
                    message.error('Failed to fetch workspaces.');
                });
        }
        if (currentWorkspace && email) {
            fetchFolders(email, currentWorkspace, setLoading)
                .then((folders) => {
                    const filteredFolders = folders.filter((folder) => folder.cleanDataExist);
                    const foldersWithWorkspaceId = filteredFolders.map((folder) => ({
                        ...folder,
                        workspaceId: currentWorkspace,
                    }));
                    setFolders(foldersWithWorkspaceId);
                })
                .catch((error) => {
                    console.error(error);
                    message.error('Failed to fetch folders.');
                });
        }
    }, [currentWorkspace, email]);

    return (
        <div className={classes.workflowPage}>
            {loading && <Preloader />}
            <Topbar
                onSaveClick={handleSaveClick}
                setWorkflowName={setWorkflowName}
                workflowName={workflowName}
                workspaceId={currentWorkspace || undefined}
                setWorkflowOutput={setWorkflowOutput}
                setIsRunClicked={setIsRunClicked}
                onRunClick={handleRunClick}
                isRunLoading={isRunLoading}
            />

            <div className={classes.workflowWrapper}>
                <Sidebar
                    workspaces={workspaces}
                    selectedWorkspace={currentWorkspace}
                    setSelectedWorkspace={setCurrentWorkspace}
                    sidebarItems={sidebarItems}
                />
                <div className={classes.reactflowMain}>
                    <ReactFlowProvider>
                        <DragAndDropContainer
                            nodes={nodes}
                            setNodes={setNodes}
                            edges={edges}
                            setEdges={setEdges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            workspaces={workspaces}
                            folders={folders}
                            selectedWorkspace={currentWorkspace}
                            setSidebarItems={setSidebarItems}
                            setOutputNodeIds={setOutputNodeIds}
                            workflowOutput={workflowOutput}
                            outputNodeIds={outputNodeIds}
                            isRunClicked={isRunClicked}
                            workflowName={workflowName}
                        />
                    </ReactFlowProvider>
                </div>
            </div>
        </div>
    );
};

export default WorkFlow;