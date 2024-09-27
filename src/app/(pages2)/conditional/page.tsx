"use client";
import React, { useRef, useCallback, useState, useMemo } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Connection,
    Edge,
    Background,
    BackgroundVariant,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import classes from '@/app/assets/css/workflow.module.css';

import Sidebar from '../components/sidebar';
import { DnDProvider, useDnD } from '../components/DnDContext';
import VariableNode from '../components/Variables';
import Topbar from '../components/topbar';
import CustomEdge from "../components/customEdge";
import LocalVariable from '../components/localVariable';
import RightSideBar from '../components/right-sidebar';
import EndNode from '../components/EndNode';
import GlobalVariable from '../components/globalVariable';
import ConditionalNode from '../components/comparator';
import Constants from "../components/constants";
import GateNode from '../components/GateNode';
import CompilerNode from '../components/Compiler'
import { message } from 'antd';

let id = 0;
const getId = () => `dndnode_${id++}`;

const Conditional: React.FC = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    const { type } = useDnD();
    const [folderdata, setFolderData] = useState<any[]>([]);
    const variableEntries = Object.entries(folderdata);

    const nodeTypes = useMemo(() => ({
        variables: VariableNode,
        constant: Constants,
        local_variable: LocalVariable,
        global_variable: GlobalVariable,
        end_node: EndNode,
        conditional: ConditionalNode,
        compiler_type: CompilerNode,
        gates: GateNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        customEdge: CustomEdge,
    }), []);

    const onConnect = useCallback(
        (params: Edge | Connection) => {
            const sourceNode = nodes.find((node) => node.id === params.source);
            const targetNode = nodes.find((node) => node.id === params.target);

            if (!sourceNode?.data?.variableType) {
                message.error("Cannot connect a node without entering a value.");
                return;
            }

            if (params.source === params.target) {
                message.error("Self-connections are not allowed.");
                return;
            }

            setNodes((nds) =>
                nds.map((node) =>
                    node.id === targetNode?.id
                        ? {
                            ...node,
                            data: {
                                ...node.data,
                                variableType: sourceNode.data.variableType,
                            },
                        }
                        : node
                )
            );
            setEdges((eds) => addEdge({ ...params, id: `${params.source}-${params.target}-${Date.now()}`, type: "customEdge" }, eds));
        },
        [nodes, setEdges, setNodes]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            if (!type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: getId(),
                type: type.nodeType,
                position,
                data: { label: type.titleName, folderdata },
            };
            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type, setNodes, folderdata]
    );

    const handleFolderData = (data: any) => {
        setFolderData(data);
    };

    const handleSave = () => {
        let outputNodeName = '';

        nodes.forEach((node) => {
            if (node.type === 'output_node' && node.data.outputName) {
                outputNodeName = node.data.outputName;
            }
        });

        const cleanedNodes = nodes.map((node) => {
            const { data, type } = node;
            const { folderdata, label, ...cleanedData } = data;

            const sourceConnections: any[] = [];
            const targetConnections: any[] = [];

            edges.forEach((edge) => {
                if (edge.source === node.id) {
                    targetConnections.push(edge.target || '');
                }
                if (edge.target === node.id) {
                    sourceConnections.push(edge.source || '');
                }
            });


            let connectedEdges = {};

            if (node.type === 'conditional') {
                const lhsConnection = edges.find((edge) => edge.target === node.id && edge.targetHandle === 'target1');
                const rhsConnection = edges.find((edge) => edge.target === node.id && edge.targetHandle === 'target2');

                connectedEdges = {
                    source: [
                        {
                            LHS: lhsConnection?.source || '',
                            RHS: rhsConnection?.source || '',
                        },
                    ],
                    target: targetConnections.length === 1 ? targetConnections[0] : targetConnections.length ? targetConnections : '',
                };
            } else {
                connectedEdges = {
                    source: sourceConnections.length === 1 ? sourceConnections[0] : sourceConnections.length ? sourceConnections : '',
                    target: targetConnections.length === 1 ? targetConnections[0] : targetConnections.length ? targetConnections : '',
                };
            }

            return {
                id: node.id,
                type,
                data: { ...cleanedData },
                connectedEdges: connectedEdges,
            };
        });

        const finalWorkflowData = {
            OutputName: outputNodeName,
            nodes: cleanedNodes,
        };

        console.log('Output JSON Data:', JSON.stringify(finalWorkflowData, null, 2));
    };

    const handleFormatHorizonatal = useCallback(() => {
        const startX = 600;
        const startY = 500;
        const horizontalSpacing = 500;
        const verticalSpacing = 250;
        let currentX = startX; 
        let currentYForVertical = startY;
        let maxVerticalY = currentYForVertical; 
        let verticalNodeCount = 0;

        const updatedNodes = nodes.map((node) => {
            if (node.type === 'variables' || node.type === 'constant') {
                verticalNodeCount += 1;
                const newNode = {
                    ...node,
                    position: {
                        x: startX, 
                        y: currentYForVertical,
                    },
                };
                currentYForVertical += verticalSpacing; 
                maxVerticalY = currentYForVertical; 
                return newNode;
            }
            return node; 
        });

        const centerYForHorizontalNodes = startY + ((currentYForVertical - startY) - verticalSpacing) / 2; 
        currentX += horizontalSpacing; 
        const updatedNodesWithHorizontal = updatedNodes.map((node) => {
            if (node.type !== 'variables' && node.type !== 'constant') {
                if (node.type === 'conditional') {

                    const newNode = {
                        ...node,
                        position: {
                            x: currentX,
                            y: centerYForHorizontalNodes,
                        },
                    };
                    currentX += horizontalSpacing; 
                    return newNode;
                } else {

                    const newNode = {
                        ...node,
                        position: {
                            x: currentX,
                            y: centerYForHorizontalNodes, 
                        },
                    };
                    currentX += horizontalSpacing; 
                    return newNode;
                }
            }
            return node; 
        });

        setNodes(updatedNodesWithHorizontal);
    }, [nodes, edges, setNodes]);

    return (
        <div className={classes.workflowPage}>
            <Topbar onSave={handleSave} onFormat={handleFormatHorizonatal} />
            <div className={classes.workflowWrapper}>
                <Sidebar setFolderData={handleFolderData} />
                <div className={classes.reactflowMain} ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={16} size={2} color="#ddd" />
                        <Controls />
                    </ReactFlow>
                </div>
                <RightSideBar variableEntries={variableEntries} />
            </div>
        </div>
    );
};

const ConditionalOperation: React.FC = () => (
    <ReactFlowProvider>
        <DnDProvider>
            <Conditional />
        </DnDProvider>
    </ReactFlowProvider>
);

export default ConditionalOperation;
