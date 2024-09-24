"use client";
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
import EndNode from '../components/Output';
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
        let outputNodeName = '';

        nodes.forEach((node) => {
            if (node.type === 'output_node' && node.data.outputName) {
                outputNodeName = node.data.outputName;
            }
        });

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
            OutputName: outputNodeName,
            nodes: cleanedNodes,
        };

        console.log('Output Json Data', JSON.stringify(finalWorkflowData, null, 2));
    };


    return (
        <div className={classes.workflowPage}>
            <Topbar onSave={handleSave} />
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
