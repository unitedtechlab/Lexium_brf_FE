"use client"

import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
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
import AdditionSubNode from '../components/AdditionSub';
import Topbar from '../components/topbar';
import CustomEdge from "../components/customEdge";
import DivisionMultiplicationNode from '../components/DivisionMulti';
import ModifierNode from '../components/Modifier';
import CompilerNode from '../components/Compiler';
import Constants from "../components/constants";
import LocalVariable from '../components/localVariable';
import RightSideBar from '../components/right-sidebar';
import EndNode from '../components/EndNode';
import GlobalVariable from '../components/globalVariable';
import { message } from 'antd';

let id = 0;
const getId = () => `dndnode_${id++}`;

const Arithmetic: React.FC = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    const { type } = useDnD();
    const [folderdata, setFolderData] = useState<any[]>([]);
    const variableEntries = Object.entries(folderdata);
    const [operationName, setOperationName] = useState<string>('');

    const nodeTypes = useMemo(() => ({
        variables: VariableNode,
        constant: Constants,
        add_sub_type: AdditionSubNode,
        multiply_divide_type: DivisionMultiplicationNode,
        modifier_type: ModifierNode,
        compiler_type: CompilerNode,
        local_variable: LocalVariable,
        global_variable: GlobalVariable,
        end_node: EndNode,
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

            setEdges((eds) => addEdge({ ...params, type: "customEdge" }, eds));
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
        const cleanedNodes = nodes.map((node) => {
            const { data, type } = node;
            const { folderdata, label, ...cleanedData } = data;

            const sourceConnections: string[] = [];
            const targetConnections: string[] = [];

            edges.forEach((edge) => {
                if (edge.source === node.id) {
                    targetConnections.push(edge.target || '');
                }
                if (edge.target === node.id) {
                    sourceConnections.push(edge.source || '');
                }
            });

            const connectedEdges = [];

            if (sourceConnections.length || targetConnections.length) {
                connectedEdges.push({
                    source:
                        sourceConnections.length === 1
                            ? sourceConnections[0] || ''
                            : sourceConnections.length
                                ? sourceConnections
                                : '',
                    target:
                        targetConnections.length === 1
                            ? targetConnections[0] || ''
                            : targetConnections.length
                                ? targetConnections
                                : '',
                });
            }

            return {
                id: node.id,
                type,
                data: { ...cleanedData },
                connectedEdges: connectedEdges.length > 0 ? connectedEdges : undefined,
            };
        });

        const finalWorkflowData = {
            ruleName: operationName,
            nodes: cleanedNodes,
        };

        console.log('Output Json Data', JSON.stringify(finalWorkflowData, null, 2));
    };

    const handleFormatHorizonatal = useCallback(() => {
        const startX = 200;
        const startY = 200;
        const horizontalSpacing = 450;
        const verticalSpacing = 120;
        const secLevelVerSpacing = 120;
        let currentYVertical = startY;

        const nodesPostion = new Set();
        const updatedNodes: any[] = [];
        const placeNode = (node: any, x: number, y: number) => {
            nodesPostion.add(node.id);
            return { ...node, position: { x, y } };
        };
        const getConnectedEdges = (nodeId: string) => {
            const sourceConnections = edges.filter(edge => edge.source === nodeId);
            const targetConnections = edges.filter(edge => edge.target === nodeId);
            return { sourceConnections, targetConnections };
        };

        const initialNodes = nodes.filter(node => {
            const { sourceConnections, targetConnections } = getConnectedEdges(node.id);
            return (
                (node.type === 'variables' ||
                    node.type === 'constant' ||
                    node.type === 'local_variable' ||
                    node.type === 'global_variable') &&
                sourceConnections.length > 0 &&
                targetConnections.length === 0
            );
        });

        initialNodes.forEach((node) => {
            updatedNodes.push(placeNode(node, startX, currentYVertical));
            currentYVertical += verticalSpacing;
        });

        const childNodesPosition = (parentNode: any, currentX: number, parentY: number, level: number) => {
            const { sourceConnections } = getConnectedEdges(parentNode.id);
            const childNodes = nodes.filter((childNode) =>
                sourceConnections.some((edge) => edge.target === childNode.id)
            );

            if (childNodes.length === 0)
                return;
            let currentYChild = parentY;

            childNodes.forEach((childNode) => {
                if (nodesPostion.has(childNode.id)) {
                    return;
                }
                currentYChild += (level === 2 ? secLevelVerSpacing : verticalSpacing);
                updatedNodes.push(
                    placeNode(childNode, currentX, currentYChild)
                );
                childNodesPosition(childNode, currentX + horizontalSpacing, currentYChild, level + 1);
            });
        };

        initialNodes.forEach((node) => {
            childNodesPosition(node, startX + horizontalSpacing, node.position.y, 1);
        });

        const inBetweenNodes = nodes.filter(node => {
            const { sourceConnections, targetConnections } = getConnectedEdges(node.id);
            return (
                (node.type === 'local_variable' || node.type === 'global_variable') &&
                sourceConnections.length > 0 &&
                targetConnections.length > 0
            );
        });

        inBetweenNodes.forEach((node) => {
            if (!nodesPostion.has(node.id)) {
                const parentNode = nodes.find((parent) =>
                    edges.some((edge) => edge.source === parent.id && edge.target === node.id)
                );

                if (parentNode) {
                    updatedNodes.push(
                        placeNode(node, parentNode.position.x + horizontalSpacing, parentNode.position.y)
                    );
                    childNodesPosition(node, parentNode.position.x + (2 * horizontalSpacing), parentNode.position.y, 2);
                }
            }
        });

        setNodes(updatedNodes);
    }, [nodes, edges, setNodes]);

    return (
        <div className={classes.workflowPage}>
            <Topbar onSave={handleSave} onFormat={handleFormatHorizonatal} setOperationName={() => { }} />
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

const ArithmeticOperation: React.FC = () => (
    <ReactFlowProvider>
        <DnDProvider>
            <Arithmetic />
        </DnDProvider>
    </ReactFlowProvider>
);

export default ArithmeticOperation;
