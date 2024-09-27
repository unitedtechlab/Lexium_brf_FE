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
import Topbar from '../components/topbar';
import CustomEdge from "../components/customEdge";
import LocalVariable from '../components/localVariable';
import RightSideBar from '../components/right-sidebar';
import EndNode from '../components/EndNode';
import GlobalVariable from '../components/globalVariable';
import ConditionalNode from '../components/comparator';
import Constants from "../components/constants";
import GateNode from '../components/GateNode'
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
  
      const updatedNodes = nodes.map((node) => {
        console.log("node", node.id)
        console.log("targetNode?.id", targetNode?.id)
        if (node.id === targetNode?.id) {
            console.log("prijnt")
          const updatedData = { ...node.data };
  console.log("updatedData",updatedData)
          // Check if the source or target nodes are constants or variables
          const isSourceConstant = sourceNode.type === 'constant';
          const isTargetConstant = targetNode.type === 'constant';
          const isSourceVariable = sourceNode.type === 'variables';
          const isTargetVariable = targetNode.type === 'variables';
  console.log("isSourceConstant",isSourceConstant, isTargetConstant)
  console.log("isSourceVariable",isSourceVariable, isTargetVariable)
          // If either node is constant or variable, set lhs and rhs values accordingly
          if ((isSourceConstant && isTargetVariable) || (isSourceVariable && isTargetConstant)) {
            // Compare the node ids to determine lhs and rhs
            if (sourceNode.id < targetNode.id) {
                console.log("in if", sourceNode.data,targetNode.data)
              updatedData.lhsValue = sourceNode.data.value || sourceNode.data.variables;
              updatedData.lhsType = sourceNode.data.variableType || sourceNode.data.lhsType;
              updatedData.rhsValue = targetNode.data.value || targetNode.data.variables;
              updatedData.rhsType = targetNode.data.variableType || targetNode.data.rhsType;
            } else {
                console.log("in ifelse", sourceNode.data,targetNode.data)
              updatedData.lhsValue = targetNode.data.value || targetNode.data.variables;
              updatedData.lhsType = targetNode.data.variableType || targetNode.data.lhsType;
              updatedData.rhsValue = sourceNode.data.value || sourceNode.data.variables;
              updatedData.rhsType = sourceNode.data.variableType || sourceNode.data.rhsType;
            }
          }
  
          return { ...node, data: updatedData };
        }
        return node;
      });
  
      setNodes(updatedNodes);
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
            console.log("newNode", newNode)
            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, type, setNodes, folderdata, nodes]
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

const ConditionalOperation: React.FC = () => (
    <ReactFlowProvider>
        <DnDProvider>
            <Conditional />
        </DnDProvider>
    </ReactFlowProvider>
);

export default ConditionalOperation;
