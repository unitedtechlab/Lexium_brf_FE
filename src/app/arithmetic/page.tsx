"use client";
import React, { useRef, useCallback } from 'react';
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

import Sidebar from './components/sidebar';
import { DnDProvider, useDnD } from './DnDContext';
import VariableNode from './components/Variables';
import AdditionSubNode from './components/AdditionSub';
import Topbar from './components/topbar';
import CustomEdge from "./customEdge";
import DivisionMultiplicationNode from './components/DivisionMulti';
import ModifierNode from './components/Modifier';
import CompilerNode from './components/Compiler';
import Constants from "./components/constants";

const nodeTypes = {
    variables: VariableNode,
    add_sub_type: AdditionSubNode,
    multiply_divide_type: DivisionMultiplicationNode,
    modifier_type: ModifierNode,
    compiler_type: CompilerNode,
    constants: Constants,
};

const edgeTypes = {
    customEdge: CustomEdge,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow: React.FC = () => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    const { type } = useDnD();

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, type: 'customEdge' }, eds)),
        [setEdges]
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
                data: { label: type.titleName, columns: type.columns || [] },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type, setNodes]
    );

    const handleSave = () => {
        const cleanedNodes = nodes.map((node) => {
            const { data, type } = node;
            const { columns, label, ...cleanedData } = data;

            const connectedEdges = edges
                .filter((edge) => edge.source === node.id || edge.target === node.id)
                .map((edge) => ({
                    source: edge.source === node.id ? "" : edge.source,
                    target: edge.target === node.id ? "" : edge.target,
                }));

            return {
                id: node.id,
                type,
                data: { ...cleanedData },
                connectedEdges: connectedEdges.length > 0 ? connectedEdges : undefined,
            };
        });

        const finalNode = cleanedNodes.find((node) => node.data.additionNodeValues || node.data.substractionNodeValues || node.data.multiplyValues || node.data.divideValues);
        if (finalNode) {
            const finalConnectedSources = edges
                .filter((edge) => edge.target === finalNode.id)
                .map((edge) => edge.source)
                .join(",");

            finalNode.connectedEdges = [
                {
                    source: finalConnectedSources,
                    target: "",
                },
            ];
        }

        console.log(JSON.stringify(cleanedNodes, null, 2));
    };

    return (
        <div className={classes.workflowPage}>
            <Topbar onSave={handleSave} />
            <div className={classes.workflowWrapper}>
                <Sidebar />
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
            </div>
        </div>
    );
};

const DnDFlowApp: React.FC = () => (
    <ReactFlowProvider>
        <DnDProvider>
            <DnDFlow />
        </DnDProvider>
    </ReactFlowProvider>
);

export default DnDFlowApp;
