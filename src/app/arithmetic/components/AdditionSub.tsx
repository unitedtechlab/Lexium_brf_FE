import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';

const AdditionSubNode = ({ id, data, type }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [connectedValues, setConnectedValues] = useState<any>({
        firstNodeValues: [],
        secondNodeValues: []
    });

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);

        let firstNodeValues: any[] = [];
        let secondNodeValues: any[] = [];

        edges.forEach((edge, index) => {
            const sourceNode = getNode(edge.source);
            const sourceNodeData = sourceNode?.data;

            if (index === 0 && sourceNodeData) {
                Object.entries(sourceNodeData).forEach(([key, value]) => {
                    if (key.startsWith('value') || key.startsWith('variable')) {
                        firstNodeValues.push(value);
                    }
                });
            }

            if (index === 1 && sourceNodeData) {
                Object.entries(sourceNodeData).forEach(([key, value]) => {
                    if (key.startsWith('value') || key.startsWith('variable')) {
                        secondNodeValues.push(value);
                    }
                });
            }
        });

        setConnectedValues({ firstNodeValues, secondNodeValues });

        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            firstNodeValues,
                            secondNodeValues,
                        }
                    }
                    : node
            )
        );
    }, [getEdges, getNode, id, setNodes]);

    const isValidConnection = (connection: Connection | Edge) => {
        const edges = getEdges().filter((edge) => edge.target === id);
        return edges.length < 2;
    };

    return (
        <div>
            <div className={styles['starting-point-label']}>
                +
            </div>
            <div className={styles['nodeBox']}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <Image src={TableImage} alt='Table Image' width={32} height={32} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || "Addition / Subtraction"}</h6>
                                <span>{type || "Node type not found"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['minus-point-label']}>
                -
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

export default AdditionSubNode;
