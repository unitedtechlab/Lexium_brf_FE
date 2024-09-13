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
import InputField from './components/InputNode';
import AdditionSubNode from './components/AdditionSub';
import Topbar from './components/topbar';
import CustomEdge from "./customEdge";
import DivisionMultiplicationNode from './components/DivisionMulti';
import ModifierNode from './components/Modifier';
import CompilerNode from './components/Compiler';
import Constants from "./components/constants"

const nodeTypes = {
    variables: InputField,
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
                data: { label: type.titleName, columns: type.columns || [] }, // Pass columns to the node
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type, setNodes]
    );

    return (
        <div className={classes.workflowPage}>
            <Topbar />
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
