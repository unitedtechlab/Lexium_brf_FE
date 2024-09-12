import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';

const DivisionMultiply = ({ id, data, type }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [nodeConnections, setNodeConnections] = useState<any>({
        multiplyValues: [],
        divideValues: []
    });

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);

        const multiplyValues: any[] = [];
        const divideValues: any[] = [];

        edges.forEach((edge, index) => {
            const sourceNode = getNode(edge.source);
            const sourceNodeData = sourceNode?.data;

            if (sourceNodeData) {
                // Get only the actual values (numbers/strings)
                const filteredValues = Object.values(sourceNodeData).filter(
                    (value) => typeof value === 'number' || typeof value === 'string'
                );

                if (index === 0) {
                    // First connected node (for multiplication)
                    multiplyValues.push({
                        node: {
                            id: sourceNode.id,
                            data: filteredValues
                        }
                    });
                } else {
                    // Other connected nodes (for division)
                    divideValues.push({
                        node: {
                            id: sourceNode.id,
                            data: filteredValues
                        }
                    });
                }
            }
        });

        // Update state with the connections
        setNodeConnections({ multiplyValues, divideValues });

        // Store the values in node's data for JSON export
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, multiplyValues, divideValues } }
                    : node
            )
        );
    }, [getEdges, getNode, id, setNodes]);

    const isValidConnection = (connection: Connection | Edge) => {
        const edges = getEdges().filter((edge) => edge.target === id);
        return edges.length < 2; // Limit to 2 connections
    };

    return (
        <div>
            <div className={styles['starting-point-label']}>
                *
            </div>
            <div className={styles['nodeBox']}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <Image src={TableImage} alt='Table Image' width={32} height={32} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || "Multiplication / Division"}</h6>
                                <span>{type || "Node type not found"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['minus-point-label']}>
                /
            </div>

            <Handle
                type="target"
                position={Position.Left}
                id="target1"
                isValidConnection={isValidConnection}
                style={{ top: '35%' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target2"
                isValidConnection={isValidConnection}
                style={{ top: '65%' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="source"
            />
        </div>
    );
};

export default DivisionMultiply;
