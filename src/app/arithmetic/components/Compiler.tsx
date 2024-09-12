import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { Select } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';

const CompilerNode = ({ id, data, type }: NodeProps<any>) => {
    const { setNodes } = useReactFlow();
    const [operation, setOperation] = useState<string>(data.operation || 'min'); // Initialize with data.operation or default to 'min'

    useEffect(() => {
        // Update node's data when operation changes
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, operation } } : node
            )
        );
    }, [operation, id, setNodes]);

    const handleOperationChange = (value: string) => {
        setOperation(value); // Update selected operation
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
                            value={operation} // Bind the select to the current operation state
                            style={{ width: '100%' }}
                            onChange={handleOperationChange} // Update the state when the user selects a new option
                            getPopupContainer={(triggerNode) => triggerNode.parentNode} // Fixes dropdown rendering in ReactFlow
                            className="nodrag"
                        >
                            <Select.Option value="min">Min</Select.Option>
                            <Select.Option value="max">Max</Select.Option>
                        </Select>
                    </div>
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Left}
                id="input"
            />

            <Handle
                type="source"
                position={Position.Right}
                id="source"
            />
        </div>
    );
};

export default CompilerNode;
