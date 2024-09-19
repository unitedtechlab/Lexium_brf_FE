import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection, Edge } from 'reactflow';
import { Select } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';

const ModifierNode = ({ id, data, type }: NodeProps<any>) => {
    const { getEdges, setNodes } = useReactFlow();
    const [operation, setOperation] = useState<string>(data.operation || 'absolute');

    useEffect(() => {
        // Set operation in node data
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, operation } } : node
            )
        );
    }, [operation, id, setNodes]);

    // Handle operation change for the dropdown
    const handleOperationChange = (value: string) => {
        setOperation(value);
    };

    // Check if the target connection is valid (ensure one connection)
    const isValidConnection = (connection: Connection | Edge) => {
        const edges = getEdges().filter((edge) => edge.target === id);
        return edges.length === 0;  // Only allow one target connection
    };

    // Check if the source connection is valid (ensure one connection)
    const isValidSourceConnection = (connection: Connection | Edge) => {
        const edges = getEdges().filter((edge) => edge.source === id);
        return edges.length === 0;  // Only allow one source connection
    };

    return (
        <div>
            <div className={styles['nodeBox']}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <Image src={TableImage} alt='Table Image' width={32} height={32} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || "Modifier"}</h6>
                                <span>{type || "Node type not found"}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '100%' }}>
                        <Select
                            value={operation}
                            style={{ width: '100%' }}
                            onChange={handleOperationChange}
                            getPopupContainer={(triggerNode) => triggerNode.parentNode}
                            className="nodrag"
                        >
                            <Select.Option value="absolute">Absolute</Select.Option>
                            <Select.Option value="round">Round</Select.Option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Target Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id="input"
                isValidConnection={isValidConnection}
            />

            {/* Source Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="source"
                isValidConnection={isValidSourceConnection}
            />
        </div>
    );
};

export default ModifierNode;
