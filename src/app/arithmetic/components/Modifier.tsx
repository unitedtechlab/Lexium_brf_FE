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
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, operation } } : node
            )
        );
    }, [operation, id, setNodes]);

    const handleOperationChange = (value: string) => {
        setOperation(value);
    };

    const isValidConnection = (connection: Connection | Edge) => {
        const edges = getEdges().filter((edge) => edge.target === id);
        return edges.length === 0;
    };

    const isValidSourceConnection = (connection: Connection | Edge) => {
        const edges = getEdges().filter((edge) => edge.source === id);
        return edges.length === 0;
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

            <Handle
                type="target"
                position={Position.Left}
                id="input"
                isValidConnection={isValidConnection}
            />

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
