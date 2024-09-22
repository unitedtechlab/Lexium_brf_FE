import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection, Edge } from 'reactflow';
import { Select, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';

const ModifierNode = ({ id, data, type }: NodeProps<any>) => {
    const { getEdges, setNodes } = useReactFlow();
    const [operation, setOperation] = useState<string>(data.operation || 'absolute');
    const [firstConnectedNodeType, setFirstConnectedNodeType] = useState<string | null>(null);
    const errorShownRef = useRef({ target: false, source: false });

    const showErrorOnce = (msg: string, type: 'source' | 'target') => {
        if (!errorShownRef.current[type]) {
            message.error(msg);
            errorShownRef.current[type] = true;
            setTimeout(() => {
                errorShownRef.current[type] = false;
            }, 2000);
        }
    };

    useEffect(() => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, operation } } : node
            )
        );
        if (data.variableType) {
            setFirstConnectedNodeType(data.variableType);
          }

    }, [operation, id, setNodes,data.variableType]);

    const handleOperationChange = (value: string) => {
        setOperation(value);
    };

    const isValidTargetConnection = (connection: Connection) => {
        const edges = getEdges().filter((edge) => edge.target === id);
        if (edges.length >= 1) {
            showErrorOnce('Only one incoming connection is allowed to the target.', 'target');
            return false;
        }
        return true;
    };

    const isValidSourceConnection = (connection: Connection) => {
        const edges = getEdges().filter((edge) => edge.source === id);
        if (edges.length >= 1) {
            showErrorOnce('Only one outgoing connection is allowed from the source.', 'source');
            return false;
        }
        return true;
    };

    const isValidConnection = (connection: Connection) => {
        if (connection.target === id && connection.targetHandle === 'target') {
            return isValidTargetConnection(connection);
        }
        if (connection.source === id && connection.sourceHandle === 'source') {
            return isValidSourceConnection(connection);
        }
        return true;
    };

    return (
        <div>
            <div className={styles['nodeBox']}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <Image src={TableImage} alt='Table Image' width={32} height={32} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || 'Modifier'}</h6>
                                <span>{firstConnectedNodeType ? `Type: ${firstConnectedNodeType}` : "No Type Connected"}</span>
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
                id="target"
                isValidConnection={isValidConnection}
            />

            {/* Source Handle */}
            <Handle
                type="source"
                position={Position.Right}
                id="source"
                isValidConnection={isValidConnection}
            />
        </div>
    );
};

export default ModifierNode;
