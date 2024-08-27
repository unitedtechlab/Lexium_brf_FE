"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import classes from './workflow.module.css';
import { useNodesState, useEdgesState, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { fetchWorkspaces, fetchFolders } from '@/app/API/api';
import { useEmail } from '@/app/context/emailContext';
import { message } from 'antd';
import { CustomNode } from '../types/workflowTypes';
import Sidebar from './components/sidebar';
import Topbar from './components/topbar';
import { Node, Edge } from 'reactflow';
import axios from 'axios';
import { BaseURL } from "@/app/constants/index";
import { getToken } from '@/utils/auth';

const initialSidebarItems = [
    { id: 'start', icon: 'MdOutlineJoinInner' as const, title: 'Starting Node', description: 'Starting Node', enabled: true },
    { id: 'filter', icon: 'MdOutlineFilterAlt' as const, title: 'Filter', description: 'Filter', enabled: false },
    { id: 'sort', icon: 'FaSortAlphaDown' as const, title: 'Sort', description: 'Sort', enabled: false },
    { id: 'conditional', icon: 'FaProjectDiagram' as const, title: 'IF/Else/And/OR', description: 'IF/Else/And/OR', enabled: false },
    { id: 'groupby', icon: 'VscGroupByRefType' as const, title: 'Group By', description: 'Group By', enabled: false },
    { id: 'Pivot', icon: 'MdOutlinePivotTableChart' as const, title: 'Pivot', description: 'Pivot', enabled: false },
    { id: 'arithmetic', icon: 'TbMathSymbols' as const, title: 'Arithmetic Operations', description: 'Arithmetic Operations', enabled: false },
    { id: 'statisticalFunction', icon: 'PiChartLineUp' as const, title: 'Statistical Function', description: 'Statistical Function', enabled: false },
    { id: 'scaling', icon: 'SiTimescale' as const, title: 'Scaling Function', description: 'Scaling Function', enabled: false },
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
            const nodeData = pivotTable
                ? {
                    ...nodeDataWithoutLabel,
                    pivotTable: {
                        index: pivotTable.pivotColumns.index,
                        column: pivotTable.pivotColumns.column,
                        value: pivotTable.pivotColumns.value,
                        functionCheckboxes: pivotTable.functionCheckboxes,
                    },
                }
                : nodeDataWithoutLabel;

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

    const handleRunClick = async () => {
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
                message.success('Workflow saved successfully');
                console.log('API Response:', response.data);
            } else {
                message.error('Failed to save workflow');
                console.error('API Response:', response);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error Response:', error.response?.data);
            } else if (error instanceof Error) {
                console.error('General Error:', error.message);
            } else {
                console.error('Unexpected Error:', error);
            }
            message.error('An error occurred while saving the workflow');
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
    }, [email]);

    useEffect(() => {
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
            <Topbar onSaveClick={handleRunClick} />
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
                        />
                    </ReactFlowProvider>
                </div>
            </div>
        </div>
    );
};

export default WorkFlow;
